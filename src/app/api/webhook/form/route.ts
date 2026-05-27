import { NextRequest, NextResponse } from 'next/server';
import { updateOrAddLead, normalizePhone } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received Google Form submission payload:', JSON.stringify(body, null, 2));

    const { name, phone, course } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const studentPhone = normalizePhone(phone);
    if (!studentPhone) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    const studentName = name?.trim() || 'Prospective Student';
    
    // Normalize course name to match standard sheet values
    let parsedCourse = 'Undecided';
    if (course) {
      const lower = course.toLowerCase().trim();
      if (lower.includes('pgdhm')) {
        parsedCourse = 'PGDHM';
      } else if (lower.includes('pgdbm')) {
        parsedCourse = 'PGDBM';
      } else if (lower.includes('bba') || lower.includes('business')) {
        parsedCourse = 'BBA';
      } else if (lower.includes('bhmct') || lower.includes('hospitality') || lower.includes('hotel management & catering')) {
        parsedCourse = 'BHMCT';
      } else if (lower.includes('dhm') || lower.includes('diploma')) {
        parsedCourse = 'DHM';
      } else {
        parsedCourse = course.trim();
      }
    }

    console.log(`Processing form submission for ${studentName} (${studentPhone}) for course: ${parsedCourse}`);

    // Update the lead in Admissions Leads sheet
    await updateOrAddLead(
      studentPhone,
      studentName,
      parsedCourse,
      'Applied', // Lead status is now officially "Applied"
      'Course Queries', // Default category
      `Google Form Submitted: Selected ${parsedCourse}`
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Form submission processed and lead updated successfully',
      data: {
        name: studentName,
        phone: studentPhone,
        course: parsedCourse,
        status: 'Applied'
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing Form submission webhook:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
