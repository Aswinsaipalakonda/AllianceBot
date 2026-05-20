import { NextRequest, NextResponse } from 'next/server';
import { toggleAIAutoReply } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const { phone, enabled } = await req.json();

    if (!phone || enabled === undefined) {
      return NextResponse.json({ success: false, error: 'Phone and enabled parameters are required' }, { status: 400 });
    }

    const success = await toggleAIAutoReply(phone, enabled);

    if (success) {
      return NextResponse.json({ success: true, message: `AI Auto Reply status updated to ${enabled}` }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error in POST /api/conversations/toggle-ai:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
