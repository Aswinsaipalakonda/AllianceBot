import { NextRequest, NextResponse } from 'next/server';
import { updateOrAddLead, appendToSheet, getLeads, normalizePhone, logChatMessage, getConversationHistory } from '@/lib/googleSheets';
import { classifyMessageAndRespond } from '@/lib/gemini';

function sanitizeButtonText(btn: string): string {
  const text = btn.trim();
  if (text.length <= 20) return text;
  
  const lower = text.toLowerCase();
  if (lower.includes('industrial internship') || lower.includes('internship')) {
    return 'Internship Info';
  }
  if (lower.includes('counselor') || lower.includes('talk to')) {
    return 'Talk to Counselor';
  }
  if (lower.includes('bhmct admission') || lower.includes('register bhmct')) {
    return 'BHMCT Admissions';
  }
  if (lower.includes('bba admission') || lower.includes('register bba')) {
    return 'BBA Admissions';
  }
  if (lower.includes('dhm admission') || lower.includes('register dhm')) {
    return 'DHM Admissions';
  }
  if (lower.includes('scholarship')) {
    return 'Scholarships';
  }
  if (lower.includes('explore course') || lower.includes('show course')) {
    return 'Explore Courses';
  }
  if (lower.includes('placement')) {
    return 'Placements Info';
  }
  if (lower.includes('hostel')) {
    return 'Hostel Info';
  }
  if (lower.includes('apply')) {
    return 'Apply Now';
  }
  if (lower.includes('visit')) {
    return 'Schedule Visit';
  }
  
  // Fallback: smart word-boundary truncation
  const cut = text.substring(0, 20);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 10) {
    return cut.substring(0, lastSpace).trim();
  }
  return cut.trim();
}

export const dynamic = 'force-dynamic';

// GET verification for Meta Webhook setup
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.META_VERIFY_TOKEN || 'alliance_secure_webhook_token_2025';

    // Meta webhook verification request
    if (mode || token || challenge) {
      if (!mode || !token || !challenge) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required webhook verification query params',
            required: ['hub.mode', 'hub.verify_token', 'hub.challenge'],
          },
          { status: 400 }
        );
      }

      if (mode === 'subscribe' && token.trim() === verifyToken.trim()) {
        console.log('Webhook verified successfully!');
        return new NextResponse(challenge, { status: 200 });
      } else {
        console.warn('Webhook verification failed: Token mismatch.');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Browser/manual health check
    return NextResponse.json(
      {
        success: true,
        message: 'AllianceBot webhook is live. Awaiting Meta verification or incoming messages.',
      },
      { status: 200 }
    );
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
        
        // Dynamically extract text content from standard text OR interactive button replies
        let messageText = '';
        if (message.type === 'text') {
          messageText = message.text?.body || '';
        } else if (message.type === 'interactive') {
          messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        }

        if (!messageText) {
          console.log(`Skipped empty or unsupported message type: "${message.type}"`);
          continue;
        }

        console.log(`Processing message from ${studentName} (${studentPhone}) [Type: ${message.type}]: "${messageText}"`);

        const timestamp = new Date().toLocaleString();

        // 1. Fetch current leads to check if Counselor Takeover is active (AI Auto-Reply disabled)
        const leads = await getLeads();
        const existingLead = leads.find((l) => normalizePhone(l.phone) === normalizePhone(studentPhone));

        // Normalize sheet Boolean string (checking case-insensitive or direct match)
        const isAIEnabled = existingLead ? (existingLead.aiEnabled && String(existingLead.aiEnabled).toUpperCase() !== 'FALSE') : true;

        if (existingLead && !isAIEnabled) {
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

          // C. Log to unified Chat Log
          await logChatMessage(studentPhone, studentName, 'user', messageText, [], category, course);

          console.log(`Successfully logged incoming human-mode message from ${studentName} for counselor follow-up.`);
          // Skip sending automatic reply
          continue;
        }

        // --- AUTOMATED AI MODE ACTIVE ---
        // 2. Fetch conversation history context for state-aware Gemini classification
        let recentHistory: { role: 'user' | 'model'; parts: string[] }[] = [];
        try {
          const rawHistory = await getConversationHistory(studentPhone);
          recentHistory = rawHistory.slice(-6).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [msg.text]
          }));
        } catch (histErr: any) {
          console.warn("Failed to load history context for Gemini webhook:", histErr.message);
        }

        // 3. Process Gemini Classification & Conversational Reply with history
        const { replyText, suggestedButtons, category, course, status } = await classifyMessageAndRespond(messageText, recentHistory);

        // A. Log user's incoming message to unified Chat Log
        await logChatMessage(studentPhone, studentName, 'user', messageText, [], category, course);

        // B. Log bot's outgoing reply to unified Chat Log
        await logChatMessage(studentPhone, studentName, 'bot', replyText, suggestedButtons, category, course);

        console.log(`AI Reply: "${replyText}"`);
        console.log(`Suggested Buttons:`, suggestedButtons);
        console.log(`Classification - Category: ${category}, Course: ${course}, Status: ${status}`);

        // A. Update/Add in overall "Admissions Leads" sheet
        await updateOrAddLead(studentPhone, studentName, course, status, category, messageText);

        // Formulate the combined reply string with button suffixes to log in Sheets
        const buttonsSuffix = suggestedButtons && suggestedButtons.length > 0
          ? `\n\n[Buttons: ${suggestedButtons.join(', ')}]`
          : '';
        const replyTextForSheet = replyText + buttonsSuffix;

        // B. Log specifically to query category sheet
        if (category === 'Course Queries') {
          await appendToSheet('Course Queries', [[timestamp, studentPhone, course, messageText, replyTextForSheet]]);
        } else if (category === 'Placement Queries') {
          await appendToSheet('Placement Queries', [[timestamp, studentPhone, messageText, replyTextForSheet]]);
        } else if (category === 'Scholarship Queries') {
          await appendToSheet('Scholarship Queries', [[timestamp, studentPhone, messageText, replyTextForSheet]]);
        } else if (category === 'Human Followups') {
          // Log student message
          await appendToSheet('Human Followups', [
            [timestamp, 'Unassigned Counselor', studentPhone, `Student Message: ${messageText}`, 'Awaiting Human Counselor'],
          ]);
          // Log bot reply (so it shows in conversation history)
          await appendToSheet('Human Followups', [
            [timestamp, 'AI Assistant', studentPhone, 'Counselor Reply', replyTextForSheet],
          ]);
        }

        // C. Send message back using Meta Graph API (supports interactive quick reply buttons)
        await sendWhatsAppMessage(studentPhone, replyText, suggestedButtons);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook POST error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// Helper function to send WhatsApp message via Meta Cloud API (with support for interactive buttons)
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  try {
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    const token = process.env.META_PERMANENT_TOKEN;

    if (!phoneId || !token) {
      console.warn('Meta credentials missing in environment variables. Simulating reply transmission.');
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

    let bodyPayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
    };

    // If buttons are provided, format them as Meta interactive quick-replies (max 3 buttons, each max 20 chars)
    if (buttons && buttons.length > 0) {
      const formattedButtons = buttons.slice(0, 3).map((btn, idx) => ({
        type: 'reply',
        reply: {
          id: `btn-${idx}-${Date.now()}`,
          title: sanitizeButtonText(btn),
        }
      }));

      bodyPayload.type = 'interactive';
      bodyPayload.interactive = {
        type: 'button',
        body: {
          text: text
        },
        action: {
          buttons: formattedButtons
        }
      };
    } else {
      bodyPayload.type = 'text';
      bodyPayload.text = {
        preview_url: false,
        body: text,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Meta API response error:', responseData);
      throw new Error(`Meta API error: ${JSON.stringify(responseData)}`);
    }

    console.log(`Successfully sent WhatsApp message to ${to} (Interactive: ${!!buttons?.length})`);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.message);
  }
}
