"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, TrendingUp, Users, Calendar, ArrowRight, BookOpen, Award, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Aggregating CRM channels and queries...</span>
      </div>
    );
  }

  // Calculate percentages and variables
  const courses = data?.courses || { BHMCT: 0, BBA: 0, DHM: 0, Undecided: 0 };
  const categories = data?.categories || { 'Course Queries': 0, 'Placement Queries': 0, 'Scholarship Queries': 0, 'Human Followups': 0 };

  const totalCourseQueries = (Object.values(courses) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalCategoryQueries = Math.max((Object.values(categories) as number[]).reduce((a: number, b: number) => a + b, 0), 1);

  // Core KPI values
  const totalLeads = data?.stats?.find((s: any) => s.label === 'Total Leads')?.value || '0';
  const confirmedAdmissions = data?.stats?.find((s: any) => s.label === 'Admissions Confirmed')?.value || '0';
  const applications = data?.stats?.find((s: any) => s.label === 'Applications')?.value || '0';

  // Calculate a conversion rate from Leads -> Converted
  const leadsInt = parseInt(totalLeads.replace(/,/g, '')) || 1;
  const convertedInt = parseInt(confirmedAdmissions.replace(/,/g, '')) || 0;
  const conversionRate = ((convertedInt / leadsInt) * 100).toFixed(1);

  // SVG calculations for Course preference bar heights
  const maxCourseVal = Math.max(...Object.values(courses) as number[], 1);
  const getBarHeight = (val: number) => {
    return ((val / maxCourseVal) * 140).toFixed(0); // scale factor for svg height
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 bg-alliance-dark">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white font-sans tracking-wide">CRM Analytics</h1>
          <p className="text-alliance-muted mt-1 text-sm">Real-time charts, conversion ratios, and interest splits compiled from Google Sheets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="bg-alliance-card border border-alliance-border rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-alliance-text hover:bg-alliance-hover hover:border-alliance-green/30 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 text-alliance-muted" />
            Refresh Data
          </button>
          <button
            onClick={() => {
              if (!data) return;
              const statsCSV = (data.stats || []).map((s: any) => `"${s.label}","${s.value}","${s.trend}"`).join('\n');
              const courseCSV = Object.entries(courses).map(([k, v]) => `"${k}","${v}"`).join('\n');
              const catCSV = Object.entries(categories).map(([k, v]) => `"${k}","${v}"`).join('\n');
              const csv = `Alliance College CRM Analytics Report\n\nKPI Metrics\nMetric,Value,Trend\n${statsCSV}\n\nCourse Preferences\nCourse,Count\n${courseCSV}\n\nQuery Categories\nCategory,Count\n${catCSV}\n\nConversion Rate: ${conversionRate}%`;
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-alliance-green text-[#111b21] rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-[#00c298] transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex items-center gap-4 hover:border-alliance-green/30 transition-all">
          <div className="p-3.5 rounded-xl bg-alliance-green/10 text-alliance-green">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-alliance-muted font-medium uppercase tracking-wider">Total CRM Leads</div>
            <div className="text-2xl font-bold text-white mt-1">{totalLeads}</div>
          </div>
        </div>

        <div className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex items-center gap-4 hover:border-alliance-green/30 transition-all">
          <div className="p-3.5 rounded-xl bg-[#53bdeb]/10 text-[#53bdeb]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-alliance-muted font-medium uppercase tracking-wider">Submissions</div>
            <div className="text-2xl font-bold text-white mt-1">{applications}</div>
          </div>
        </div>

        <div className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex items-center gap-4 hover:border-alliance-green/30 transition-all">
          <div className="p-3.5 rounded-xl bg-[#ffd279]/10 text-[#ffd279]">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-alliance-muted font-medium uppercase tracking-wider">Confirmed Joins</div>
            <div className="text-2xl font-bold text-white mt-1">{confirmedAdmissions}</div>
          </div>
        </div>

        <div className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex items-center gap-4 hover:border-alliance-green/30 transition-all">
          <div className="p-3.5 rounded-xl bg-alliance-green/15 text-alliance-green">
            <TrendingUp className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-alliance-muted font-medium uppercase tracking-wider">Conversion Ratio</div>
            <div className="text-2xl font-bold text-alliance-green mt-1">{conversionRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Analysis Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Preferences: Bar Graph */}
        <div className="bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-1">Course Preferences Breakdown</h2>
          <p className="text-xs text-alliance-muted mb-6">Distribution of interested student choices across courses.</p>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="w-full h-44 flex items-end justify-around border-b border-[#222e35] pb-2 px-4 gap-6">
              
              {/* BHMCT Bar */}
              <div className="flex flex-col items-center w-14 group">
                <span className="text-xs text-white mb-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{courses.BHMCT}</span>
                <div 
                  className="w-full bg-[#00a884] rounded-t-md hover:bg-[#00c298] transition-all cursor-pointer relative"
                  style={{ height: `${getBarHeight(courses.BHMCT)}px` }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                </div>
                <span className="text-xs font-semibold text-alliance-text mt-3">BHMCT</span>
              </div>

              {/* BBA Bar */}
              <div className="flex flex-col items-center w-14 group">
                <span className="text-xs text-white mb-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{courses.BBA}</span>
                <div 
                  className="w-full bg-[#53bdeb] rounded-t-md hover:bg-[#68cbfa] transition-all cursor-pointer relative"
                  style={{ height: `${getBarHeight(courses.BBA)}px` }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                </div>
                <span className="text-xs font-semibold text-alliance-text mt-3">BBA</span>
              </div>

              {/* DHM Bar */}
              <div className="flex flex-col items-center w-14 group">
                <span className="text-xs text-white mb-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{courses.DHM}</span>
                <div 
                  className="w-full bg-[#ffd279] rounded-t-md hover:bg-[#ffe1a6] transition-all cursor-pointer relative"
                  style={{ height: `${getBarHeight(courses.DHM)}px` }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                </div>
                <span className="text-xs font-semibold text-alliance-text mt-3">DHM</span>
              </div>

              {/* Undecided Bar */}
              <div className="flex flex-col items-center w-14 group">
                <span className="text-xs text-white mb-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{courses.Undecided}</span>
                <div 
                  className="w-full bg-red-400 rounded-t-md hover:bg-red-300 transition-all cursor-pointer relative"
                  style={{ height: `${getBarHeight(courses.Undecided)}px` }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                </div>
                <span className="text-xs font-semibold text-alliance-text mt-3">Undecided</span>
              </div>

            </div>
          </div>
        </div>

        {/* Query Categories: Pie/Donut Visual */}
        <div className="bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-1">Inquiry Channels Breakdown</h2>
          <p className="text-xs text-alliance-muted mb-6">Split of student queries classified automatically by Gemini.</p>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-10">
            {/* Custom SVG Donut Chart */}
            <div className="w-40 h-40 relative flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#222e35" strokeWidth="3" />
                
                {/* 1. Course Queries (Green) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00a884" strokeWidth="4" 
                  strokeDasharray={`${((categories['Course Queries'] || 0) / totalCategoryQueries) * 100} ${100 - (((categories['Course Queries'] || 0) / totalCategoryQueries) * 100)}`} 
                  strokeDashoffset="0"
                />

                {/* 2. Placements (Blue) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#53bdeb" strokeWidth="4" 
                  strokeDasharray={`${((categories['Placement Queries'] || 0) / totalCategoryQueries) * 100} ${100 - (((categories['Placement Queries'] || 0) / totalCategoryQueries) * 100)}`} 
                  strokeDashoffset={`-${((categories['Course Queries'] || 0) / totalCategoryQueries) * 100}`}
                />

                {/* 3. Scholarships (Yellow) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffd279" strokeWidth="4" 
                  strokeDasharray={`${((categories['Scholarship Queries'] || 0) / totalCategoryQueries) * 100} ${100 - (((categories['Scholarship Queries'] || 0) / totalCategoryQueries) * 100)}`} 
                  strokeDashoffset={`-${(((categories['Course Queries'] || 0) + (categories['Placement Queries'] || 0)) / totalCategoryQueries) * 100}`}
                />

                {/* 4. Human counselor followups (Red) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" 
                  strokeDasharray={`${((categories['Human Followups'] || 0) / totalCategoryQueries) * 100} ${100 - (((categories['Human Followups'] || 0) / totalCategoryQueries) * 100)}`} 
                  strokeDashoffset={`-${(((categories['Course Queries'] || 0) + (categories['Placement Queries'] || 0) + (categories['Scholarship Queries'] || 0)) / totalCategoryQueries) * 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{totalCategoryQueries}</span>
                <span className="text-[10px] text-alliance-muted font-bold uppercase tracking-wider">Queries</span>
              </div>
            </div>

            {/* Legends */}
            <div className="flex-1 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00a884]"></span>
                  <span className="text-sm text-alliance-text font-medium">Courses Info</span>
                </div>
                <span className="text-sm font-semibold text-white">{categories['Course Queries'] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#53bdeb]"></span>
                  <span className="text-sm text-alliance-text font-medium">Placements</span>
                </div>
                <span className="text-sm font-semibold text-white">{categories['Placement Queries'] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ffd279]"></span>
                  <span className="text-sm text-alliance-text font-medium">Scholarships</span>
                </div>
                <span className="text-sm font-semibold text-white">{categories['Scholarship Queries'] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                  <span className="text-sm text-alliance-text font-medium">Counselor Escalated</span>
                </div>
                <span className="text-sm font-semibold text-white">{categories['Human Followups'] || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Short-cut */}
      <div className="mt-8 bg-alliance-card border border-alliance-border p-6 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium text-base">Ready to take counselor overrides?</h3>
          <p className="text-alliance-muted text-xs mt-1">Open the conversations dashboard to toggle AI auto-reply and manual message students.</p>
        </div>
        <Link href="/conversations" className="bg-[#0a332c] text-[#25d366] px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#12423a] transition-all flex items-center gap-2 border border-alliance-green/10">
          Open Chats <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}
