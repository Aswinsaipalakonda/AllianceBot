import { NextRequest, NextResponse } from 'next/server';
import { updateOrAddLead, appendToSheet, getLeads } from '@/lib/googleSheets';
import { classifyMessageAndRespond } from '@/lib/gemini';

// GET verification for Meta Webhook setup
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.META_VERIFY_TOKEN || 'alliance_secure_webhook_token_2025';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully!');
        return new NextResponse(challenge, { status: 200 });
      } else {
        console.warn('Webhook verification failed: Token mismatch.');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    return new NextResponse('Bad Request', { status: 400 });
  } catch (error: any) {
    console.error('Webhook GET error:', error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST endpoint to handle incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received WhatsApp payload:', JSON.stringify(body, null, 2));

    // Ensure it's a valid WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid object type' }, { status: 400 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        // Check if there are messages (ignore status updates like 'delivered' or 'read')
        if (messages.length === 0) continue;

        const message = messages[0];
        const contact = contacts[0] || {};

        const studentPhone = message.from;
        const studentName = contact.profile?.name || 'Prospective Student';
        const messageText = message.text?.body || '';

        if (!messageText) continue;

        console.log(`Processing message from ${studentName} (${studentPhone}): "${messageText}"`);

        const timestamp = new Date().toLocaleString();

        // 1. Fetch current leads to check if Counselor Takeover is active (AI Auto-Reply disabled)
        const leads = await getLeads();
        const existingLead = leads.find((l) => l.phone === studentPhone);

        if (existingLead && !existingLead.aiEnabled) {
          // --- HUMAN TAKEOVER ACTIVE ---
          console.log(`Human takeover active for ${studentName} (${studentPhone}). Bypassing Gemini Auto-Reply.`);
          
          const category = 'Human Followups';
          const course = existingLead.course;
          const status = 'Follow-up';

          // A. Log new incoming message under Admissions Leads (resets timestamp & shows new text)
          await updateOrAddLead(studentPhone, studentName, course, status, category, messageText);

          // B. Append to Human Followups sheet so counselor gets notified
          await appendToSheet('Human Followups', [
            [timestamp, 'Unassigned Counselor', studentPhone, `Student Message: ${messageText}`, 'Awaiting Human Counselor'],
          ]);

          console.log(`Successfully logged incoming human-mode message from ${studentName} for counselor follow-up.`);
          // Skip sending automatic reply
          continue;
        }

        // --- AUTOMATED AI MODE ACTIVE ---
        // 2. Process Gemini Classification & Conversational Reply
        const { replyText, category, course, status } = await classifyMessageAndRespond(messageText);

        console.log(`AI Reply: "${replyText}"`);
        console.log(`Classification - Category: ${category}, Course: ${course}, Status: ${status}`);

        // A. Update/Add in overall "Admissions Leads" sheet
        await updateOrAddLead(studentPhone, studentName, course, status, category, messageText);

        // B. Log specifically to query category sheet
        if (category === 'Course Queries') {
          await appendToSheet('Course Queries', [[timestamp, studentPhone, course, messageText, replyText]]);
        } else if (category === 'Placement Queries') {
          await appendToSheet('Placement Queries', [[timestamp, studentPhone, messageText, replyText]]);
        } else if (category === 'Scholarship Queries') {
          await appendToSheet('Scholarship Queries', [[timestamp, studentPhone, messageText, replyText]]);
        } else if (category === 'Human Followups') {
          await appendToSheet('Human Followups', [
            [timestamp, 'Unassigned Counselor', studentPhone, `Student Message: ${messageText}`, 'Awaiting Human Counselor'],
          ]);
        }

        // C. Send message back using Meta Graph API
        await sendWhatsAppMessage(studentPhone, replyText);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook POST error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// Helper function to send WhatsApp message via Meta Cloud API
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    const token = process.env.META_PERMANENT_TOKEN;

    if (!phoneId || !token) {
      console.warn('Meta credentials missing in environment variables. Simulating reply transmission.');
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Meta API response error:', responseData);
      throw new Error(`Meta API error: ${JSON.stringify(responseData)}`);
    }

    console.log(`Successfully sent WhatsApp message to ${to}`);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.message);
  }
}
