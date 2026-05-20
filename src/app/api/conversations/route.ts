import { NextRequest, NextResponse } from 'next/server';
import { getConversationHistory } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone parameter is required' }, { status: 400 });
    }

    const messages = await getConversationHistory(phone);
    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/conversations:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
