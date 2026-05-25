import { NextRequest, NextResponse } from 'next/server';
import { updateOrAddLead, getLeads, normalizePhone, logChatMessage, getConversationHistory } from '@/lib/googleSheets';
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
        
        // Dynamically extract text content from standard text, interactive button replies, or template buttons
        let messageText = '';
        if (message.type === 'text') {
          messageText = message.text?.body || '';
        } else if (message.type === 'interactive') {
          messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        } else if (message.type === 'button') {
          messageText = message.button?.text || '';
        }

        if (!messageText) {
          console.log(`Skipped empty or unsupported message type: "${message.type}"`);
          continue;
        }

        console.log(`Processing message from ${studentName} (${studentPhone}) [Type: ${message.type}]: "${messageText}"`);

        const timestamp = new Date().toLocaleString();
        const lowerMsg = messageText.toLowerCase().trim();

        // Determine if it is a programmatic override to bypass human takeover check & history retrieval
        const isOverride = lowerMsg === 'talk to counselor' || lowerMsg === 'talk to us' || lowerMsg === 'counselor' ||
                           lowerMsg === 'apply now' || lowerMsg === 'apply' ||
                           lowerMsg === 'scholarships' || lowerMsg === 'scholarship' ||
                           lowerMsg === 'explore courses' || lowerMsg === 'courses' ||
                           lowerMsg === 'more courses' || lowerMsg === 'other courses' ||
                           lowerMsg === 'bhmct details' || lowerMsg === 'bhmct admissions' ||
                           lowerMsg === 'bba details' || lowerMsg === 'bba admissions' ||
                           lowerMsg === 'dhm details' || lowerMsg === 'dhm admissions' ||
                           lowerMsg === 'pgdhm details' || lowerMsg === 'pgdhm admissions' ||
                           lowerMsg === 'pgdbm details' || lowerMsg === 'pgdbm admissions' ||
                           lowerMsg === 'career opportunities' || lowerMsg === 'careers' || lowerMsg === 'career' || lowerMsg === 'jobs' ||
                           lowerMsg.includes('88850') || lowerMsg.includes('helpline') ||
                           lowerMsg === 'email admissions' || lowerMsg.includes('email support');

        // Check if this is a standard bot interactive re-engagement (which should turn AI back ON if it was off)
        const isBotReEngagement = isOverride && 
                                  lowerMsg !== 'talk to counselor' && 
                                  lowerMsg !== 'talk to us' && 
                                  lowerMsg !== 'counselor' &&
                                  !lowerMsg.includes('88850') && 
                                  !lowerMsg.includes('helpline') &&
                                  lowerMsg !== 'email admissions' && 
                                  !lowerMsg.includes('email support');

        // 1. Fetch current leads to check if Counselor Takeover is active (AI Auto-Reply disabled)
        const leads = await getLeads();
        const existingLead = leads.find((l) => normalizePhone(l.phone) === normalizePhone(studentPhone));

        // Normalize sheet Boolean string (checking case-insensitive or direct match)
        const isAIEnabled = existingLead ? (existingLead.aiEnabled && String(existingLead.aiEnabled).toUpperCase() !== 'FALSE') : true;

        if (existingLead && !isAIEnabled && !isOverride) {
          // --- HUMAN TAKEOVER ACTIVE ---
          console.log(`Human takeover active for ${studentName} (${studentPhone}). Bypassing Gemini Auto-Reply.`);
          
          const category = 'Human Followups';
          const course = existingLead.course;
          const status = 'Follow-up';

          // Ensure all sheets logging operations are fully completed before returning
          try {
            await Promise.all([
              updateOrAddLead(studentPhone, studentName, course, status, category, messageText),
              logChatMessage(studentPhone, studentName, 'user', messageText, [], category, course)
            ]);
            console.log(`Successfully logged incoming human-mode message from ${studentName} for counselor follow-up.`);
          } catch (err: any) {
            console.error(`Error logging human-mode message from ${studentName}:`, err.message);
          }

          // Skip sending automatic reply
          continue;
        }

        // --- AUTOMATED AI MODE / PROGRAMMATIC OVERRIDE ACTIVE ---
        let recentHistory: { role: 'user' | 'model'; parts: string[] }[] = [];
        if (!isOverride) {
          try {
            const rawHistory = await getConversationHistory(studentPhone);
            recentHistory = rawHistory.slice(-6).map((msg: any) => ({
              role: msg.sender === 'user' ? 'user' as const : 'model' as const,
              parts: [msg.text]
            }));
          } catch (histErr: any) {
            console.warn("Failed to load history context for Gemini webhook:", histErr.message);
          }
        } else {
          console.log(`Intercepted programmatic override: "${messageText}". Bypassing history retrieval.`);
        }

        // 3. Process Gemini Classification & Conversational Reply with history
        const { replyText, suggestedButtons, category, course, status, sendCareersImages, sendCourseImage } = await classifyMessageAndRespond(messageText, recentHistory) as any;

        // A. IMMEDIATELY send WhatsApp message back to minimize user delay
        if (sendCareersImages) {
          const baseUrl = new URL(req.url).origin;
          // Send the text introduction first
          await sendWhatsAppMessage(studentPhone, replyText);
          // Then send BBA careers image
          await sendWhatsAppMessage(studentPhone, "💼 *BBA Career Opportunities*:", undefined, `${baseUrl}/bba.jpeg`);
          // Then send Hotel Management careers image
          await sendWhatsAppMessage(studentPhone, "🏨 *Hotel Management Career Opportunities*:", undefined, `${baseUrl}/hotel.jpeg`);
          // Then send the interactive buttons with a clear prompt to ensure they always transmit and display
          await sendWhatsAppMessage(studentPhone, "Would you like to start your application process or explore further?", suggestedButtons);
        } else if (sendCourseImage) {
          const baseUrl = new URL(req.url).origin;
          const imgName = sendCourseImage === 'bba' ? 'bba.jpeg' : 'hotel.jpeg';
          // Send a single WhatsApp message with image header, rich text body, and action buttons
          await sendWhatsAppMessage(studentPhone, replyText, suggestedButtons, `${baseUrl}/${imgName}`);
        } else {
          await sendWhatsAppMessage(studentPhone, replyText, suggestedButtons);
        }

        // B. Ensure all master sheets logging operations are fully completed before returning
        try {
          // Log user message sequentially to prevent concurrent append race conditions on the same 'Chat Log' sheet
          await logChatMessage(studentPhone, studentName, 'user', messageText, [], category, course)
            .catch(e => console.error("Error logging user chat:", e.message));
          
          // Log bot message and update the lead in parallel (different sheets, so completely safe and race-free)
          await Promise.all([
            logChatMessage(studentPhone, studentName, 'bot', replyText, suggestedButtons, category, course).catch(e => console.error("Error logging bot chat:", e.message)),
            updateOrAddLead(
              studentPhone, 
              studentName, 
              course, 
              status, 
              category, 
              messageText, 
              isBotReEngagement ? true : undefined
            ).catch(e => console.error("Error updating lead:", e.message))
          ]);
          console.log(`All master sheets logging successfully completed for ${studentPhone}`);
        } catch (err: any) {
          console.error("Logging to Google Sheets failed:", err.message);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook POST error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// Helper function to send WhatsApp message via Meta Cloud API (with support for interactive buttons and media images)
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[], imageUrl?: string) {
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

    if (imageUrl && buttons && buttons.length > 0) {
      // Send interactive message with image header, text body, and quick-reply buttons
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
        header: {
          type: 'image',
          image: {
            link: imageUrl
          }
        },
        body: {
          text: text
        },
        action: {
          buttons: formattedButtons
        }
      };
    } else if (imageUrl) {
      // Send image message with an optional caption
      bodyPayload.type = 'image';
      bodyPayload.image = {
        link: imageUrl,
        caption: text || undefined
      };
    } else if (buttons && buttons.length > 0) {
      // If buttons are provided, format them as Meta interactive quick-replies (max 3 buttons, each max 20 chars)
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
      // Otherwise, send a standard text message
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

    console.log(`Successfully sent WhatsApp message to ${to} (Type: ${imageUrl ? 'image' : (buttons?.length ? 'interactive' : 'text')})`);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.message);
  }
}
