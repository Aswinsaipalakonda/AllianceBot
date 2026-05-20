import { NextResponse } from 'next/server';
import { getLeads, updateOrAddLead } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, leads }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/leads:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, course, status, category, lastMessage } = await request.json();
    if (!name || !phone || !course) {
      return NextResponse.json({ success: false, error: 'Name, phone, and course are required.' }, { status: 400 });
    }

    await updateOrAddLead(
      phone,
      name,
      course,
      status || 'New Lead',
      category || 'Course Queries',
      lastMessage || 'Lead created via Admissions Console'
    );

    return NextResponse.json({ success: true, message: 'Lead synced successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/leads:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
