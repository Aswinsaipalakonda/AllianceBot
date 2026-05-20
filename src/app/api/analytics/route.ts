import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await getLeads();

    const totalLeads = leads.length;
    let activeConversations = 0;
    let applicationsCount = 0;
    let admissionsConfirmed = 0;
    let pendingFollowups = 0;

    // Course distribution count
    const courses: Record<string, number> = { BHMCT: 0, BBA: 0, DHM: 0, Undecided: 0 };
    // Category distribution count
    const categories: Record<string, number> = {
      'Course Queries': 0,
      'Placement Queries': 0,
      'Scholarship Queries': 0,
      'Human Followups': 0,
    };

    leads.forEach((lead) => {
      // 1. Core KPIs
      if (['New Lead', 'Interested', 'Follow-up'].includes(lead.status)) {
        activeConversations++;
      }
      if (lead.status === 'Applied') {
        applicationsCount++;
      }
      if (lead.status === 'Converted') {
        admissionsConfirmed++;
      }
      if (lead.status === 'Follow-up' || lead.category === 'Human Followups') {
        pendingFollowups++;
      }

      // 2. Course preference breakdown
      if (courses[lead.course] !== undefined) {
        courses[lead.course]++;
      } else {
        courses['Undecided']++;
      }

      // 3. Query category breakdown
      if (categories[lead.category] !== undefined) {
        categories[lead.category]++;
      } else {
        categories['Course Queries']++;
      }
    });

    // Mock trend percentages for high aesthetics
    const analytics = {
      stats: [
        { label: 'Total Leads', value: totalLeads.toLocaleString(), trend: '+14%', isUp: true },
        { label: 'Active Conversations', value: activeConversations.toLocaleString(), trend: '+6%', isUp: true },
        { label: 'Applications', value: applicationsCount.toLocaleString(), trend: '+19%', isUp: true },
        { label: 'Admissions Confirmed', value: admissionsConfirmed.toLocaleString(), trend: '+22%', isUp: true },
        { label: 'Pending Follow-ups', value: pendingFollowups.toLocaleString(), trend: '-8%', isUp: false },
      ],
      courses,
      categories,
      // Reconstruct activity feed dynamically from actual leads list
      recentActivity: leads
        .slice(-5)
        .reverse()
        .map((lead) => ({
          name: lead.name,
          phone: lead.phone,
          course: lead.course,
          status: lead.status,
          time: lead.timestamp.split(',')[1]?.trim() || 'Just now',
        })),
    };

    return NextResponse.json({ success: true, analytics }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/analytics:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
