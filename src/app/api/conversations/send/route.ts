import { NextRequest, NextResponse } from 'next/server';
import { logCounselorReply } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const { phone, message, counselorName } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'Phone and message are required' }, { status: 400 });
    }

    const senderName = counselorName || 'Admissions Counselor';

    // 1. Send WhatsApp message using Meta Cloud API
    await sendWhatsAppMessage(phone, message);

    // 2. Log manual counselor reply in Sheets
    await logCounselorReply(phone, senderName, message);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/conversations/send:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: text
        }
      })
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Meta API response error:', responseData);
      throw new Error(`Meta API error: ${JSON.stringify(responseData)}`);
    }

    console.log(`Successfully sent manual WhatsApp message to ${to}`);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.message);
    throw error; // Propagate error so client gets alerted if dispatch fails
  }
}
