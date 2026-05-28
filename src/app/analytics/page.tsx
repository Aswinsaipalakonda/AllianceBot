"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, TrendingUp, Users, Calendar, ArrowRight, BookOpen, 
  Award, RefreshCw, Download, BarChart3, PieChart, Sparkles, 
  TrendingDown, CheckCircle2, FileText, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | '30d' | '7d'>('all');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [syncTime, setSyncTime] = useState<string>('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
        const now = new Date();
        setSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-alliance-green/10 border-t-alliance-green rounded-full animate-spin"></div>
          <Sparkles className="absolute h-6 w-6 text-alliance-green animate-pulse" />
        </div>
        <span className="text-alliance-muted text-sm font-medium animate-pulse mt-2">Aggregating CRM channels and queries...</span>
      </div>
    );
  }

  // Calculate percentages and variables
  const courses = data?.courses || { BHMCT: 0, BBA: 0, DHM: 0, IHMT: 0, PGDHM: 0, PGDBM: 0, Undecided: 0 };
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
  const getBarHeightPercent = (val: number) => {
    return ((val / maxCourseVal) * 100).toFixed(0);
  };

  const courseKeys = [
    { 
      key: 'BHMCT', 
      label: 'BHMCT', 
      fullName: 'Bachelor of Hotel Management & Catering Technology (BHMCT)', 
      colorFrom: 'from-[#005c4b]', 
      colorTo: 'to-[#00a884]', 
      borderClass: 'border-[#00a884]/30 hover:border-[#00a884]/60',
      glowColor: 'rgba(0,168,132,0.4)', 
      icon: Award, 
      desc: '3-year professional hospitality degree with industry-standard labs and premium placement partnerships.' 
    },
    { 
      key: 'BBA', 
      label: 'BBA', 
      fullName: 'Bachelor of Business Administration (BBA)', 
      colorFrom: 'from-[#1b80a4]', 
      colorTo: 'to-[#53bdeb]', 
      borderClass: 'border-[#53bdeb]/30 hover:border-[#53bdeb]/60',
      glowColor: 'rgba(83,189,235,0.4)', 
      icon: TrendingUp, 
      desc: '3-year comprehensive undergraduate degree focused on business management and dual specializations.' 
    },
    { 
      key: 'DHM', 
      label: 'DHM', 
      fullName: 'Diploma in Hotel Management (DHM)', 
      colorFrom: 'from-[#c59129]', 
      colorTo: 'to-[#ffd279]', 
      borderClass: 'border-[#ffd279]/30 hover:border-[#ffd279]/60',
      glowColor: 'rgba(255,210,121,0.4)', 
      icon: BookOpen, 
      desc: '1-year fast-track technical diploma course for high-performance operations in culinary arts and guest services.' 
    },
    { 
      key: 'IHMT', 
      label: 'IHMT', 
      fullName: 'Intermediate in Hotel Management and Catering Technology', 
      colorFrom: 'from-[#7c3aed]', 
      colorTo: 'to-[#a78bfa]', 
      borderClass: 'border-[#a78bfa]/30 hover:border-[#a78bfa]/60',
      glowColor: 'rgba(167,139,250,0.4)', 
      icon: Users, 
      desc: '2-year foundational junior college course in hospitality basics, catering science, and culinary fundamentals.' 
    },
    { 
      key: 'PGDHM', 
      label: 'PGDHM', 
      fullName: 'Post Graduate Diploma in Hotel Management / Tourism & Travel Management', 
      colorFrom: 'from-[#0f766e]', 
      colorTo: 'to-[#14b8a6]', 
      borderClass: 'border-[#14b8a6]/30 hover:border-[#14b8a6]/60',
      glowColor: 'rgba(20,184,166,0.4)', 
      icon: CheckCircle2, 
      desc: '1-year advanced professional course focused on global tourism, hospitality leadership, and travel management.' 
    },
    { 
      key: 'PGDBM', 
      label: 'PGDBM', 
      fullName: 'Post Graduate Diploma in Business Management (PGDBM)', 
      colorFrom: 'from-[#b91c1c]', 
      colorTo: 'to-[#f87171]', 
      borderClass: 'border-[#f87171]/30 hover:border-[#f87171]/60',
      glowColor: 'rgba(248,113,113,0.4)', 
      icon: FileText, 
      desc: '2-year premium post-graduate management program with specializations in Finance, HR, and Marketing.' 
    },
    { 
      key: 'Undecided', 
      label: 'Undecided', 
      fullName: 'General Inquiry / Consultation Needed', 
      colorFrom: 'from-[#4b5563]', 
      colorTo: 'to-[#9ca3af]', 
      borderClass: 'border-[#9ca3af]/30 hover:border-[#9ca3af]/60',
      glowColor: 'rgba(156,163,175,0.4)', 
      icon: Sparkles, 
      desc: 'Prospective students inquiring about general admissions, campus walkthroughs, or unassigned configurations.' 
    }
  ];

  const categoryKeys = [
    { key: 'Course Queries', label: 'Courses Info', color: '#00a884', bgClass: 'bg-[#00a884]', shadowClass: 'shadow-[0_0_12px_rgba(0,168,132,0.3)]', desc: 'Direct curriculum, fee structure, and eligibility queries' },
    { key: 'Placement Queries', label: 'Placements Info', color: '#53bdeb', bgClass: 'bg-[#53bdeb]', shadowClass: 'shadow-[0_0_12px_rgba(83,189,235,0.3)]', desc: 'Corporate recruiters, average package, and internship requests' },
    { key: 'Scholarship Queries', label: 'Scholarships', color: '#ffd279', bgClass: 'bg-[#ffd279]', shadowClass: 'shadow-[0_0_12px_rgba(255,210,121,0.3)]', desc: 'Merit-based waivers, scholarships, and installment schedules' },
    { key: 'Human Followups', label: 'Counselor Followups', color: '#ef4444', bgClass: 'bg-[#ef4444]', shadowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]', desc: 'Complex questions flagged for direct counselor callbacks' },
  ];

  // Compute SVG slice offset angles
  let accumulatedPercent = 0;
  const segments = categoryKeys.map((item) => {
    const val = categories[item.key] || 0;
    const percent = totalCategoryQueries > 0 ? (val / totalCategoryQueries) * 100 : 0;
    const offset = accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...item,
      val,
      percent,
      offset,
    };
  });

  // Active highlighted course card details (or fallback to the highest interest one)
  let defaultHighestCourse = 'BHMCT';
  let highestCount = -1;
  Object.entries(courses).forEach(([key, val]) => {
    const count = typeof val === 'number' ? val : 0;
    if (count > highestCount) {
      highestCount = count;
      defaultHighestCourse = key;
    }
  });
  const activeCourseDetail = courseKeys.find(c => c.key === (hoveredCourse || defaultHighestCourse)) || courseKeys[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-alliance-dark pb-28 md:pb-8">
      
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alliance-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alliance-green"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-alliance-green uppercase">Live Google Sheets Feed</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-alliance-text tracking-tight flex items-center gap-2">
            CRM <span className="text-alliance-green">Analytics</span>
          </h1>
          <p className="text-alliance-muted mt-1 text-sm font-medium">Real-time interest splits, conversation categories, and conversion ratio tracking.</p>
        </div>

        {/* Filter and Actions Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulated Time Range Selector */}
          <div className="bg-alliance-card border border-alliance-border p-1 rounded-xl flex items-center gap-1 shadow-sm">
            {(['all', '30d', '7d'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                  activeFilter === f
                    ? "bg-alliance-green text-white font-bold shadow-[0_2px_8px_rgba(0,128,105,0.15)]"
                    : "text-alliance-muted hover:text-alliance-text hover:bg-alliance-hover"
                )}
              >
                {f === 'all' ? 'All Time' : f === '30d' ? 'Last 30 Days' : 'Last 7 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="bg-alliance-card border border-alliance-border rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-alliance-text hover:bg-alliance-hover hover:border-alliance-green/30 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-4 w-4 text-alliance-muted animate-spin-slow" />
            <span className="font-semibold hidden sm:inline">Synced {syncTime || 'Just Now'}</span>
            <span className="font-semibold sm:hidden">Refresh</span>
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
              link.setAttribute('download', `alliance_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-alliance-green text-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-[0_4px_12px_rgba(0,128,105,0.15)] hover:bg-[#00a884] transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total CRM Leads', value: totalLeads, icon: Users, color: 'text-alliance-green', bg: 'bg-alliance-green/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_4px_12px_rgba(0,128,105,0.03)]' },
          { label: 'Form Applications', value: applications, icon: FileText, color: 'text-[#008069]', bg: 'bg-alliance-green/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_4px_12px_rgba(0,128,105,0.03)]' },
          { label: 'Confirmed Admissions', value: confirmedAdmissions, icon: CheckCircle2, color: 'text-[#b27b0b]', bg: 'bg-[#ffd279]/15', border: 'hover:border-[#ffd279]/30', glow: 'shadow-[0_4px_12px_rgba(255,210,121,0.03)]' },
          { label: 'Conversion Ratio', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-alliance-green', bg: 'bg-alliance-green/15', border: 'hover:border-alliance-green/45', glow: 'shadow-[0_4px_15px_rgba(0,128,105,0.05)]' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className={clsx(
                "bg-alliance-card border border-alliance-border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md group cursor-pointer shadow-sm",
                item.border,
                item.glow
              )}
            >
              {/* Decorative radial overlay */}
              <div className={clsx("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-300", item.bg)} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110", item.bg)}>
                  <Icon className={clsx("h-5 w-5", item.color)} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-extrabold text-alliance-green bg-alliance-green/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </span>
              </div>
              <div>
                <div className="text-[11px] text-alliance-muted font-bold uppercase tracking-wider">{item.label}</div>
                <div className="text-2xl font-black text-alliance-text mt-1 group-hover:text-alliance-green transition-colors">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Preferences: Glowing Capsule Bar Chart */}
        <div className="bg-alliance-card border border-alliance-border rounded-2xl p-6 flex flex-col justify-between min-h-[460px] relative overflow-hidden shadow-sm">
          {/* Subtle grid elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-alliance-text tracking-wide flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-alliance-green" />
                Course Interest Breakdown
              </h2>
              <span className="text-[10px] text-alliance-green bg-alliance-green/10 px-2 py-0.5 rounded-full font-bold uppercase">Dynamic Metric</span>
            </div>
            <p className="text-xs text-alliance-muted font-medium mb-6">Distribution of interested student choices across academic segments. Hover a bar for details.</p>
          </div>
          
          {/* Equalizer Capsule Chart Grid */}
          <div className="flex-1 flex flex-col justify-end relative z-10">
            {/* Guide Grid Lines */}
            <div className="absolute inset-x-0 bottom-12 top-4 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-t border-dashed border-alliance-border w-full" />
              <div className="border-t border-dashed border-alliance-border w-full" />
              <div className="border-t border-dashed border-alliance-border w-full" />
            </div>

            <div className="w-full h-48 flex items-end justify-around border-b border-alliance-border pb-2 px-1 gap-1.5 sm:gap-3 md:gap-4 relative">
              {courseKeys.map((c) => {
                const count = courses[c.key] || 0;
                const percent = getBarHeightPercent(count);
                const isHovered = hoveredCourse === c.key;
                
                return (
                  <div 
                    key={c.key}
                    onMouseEnter={() => setHoveredCourse(c.key)}
                    onMouseLeave={() => setHoveredCourse(null)}
                    className="flex flex-col items-center w-8 sm:w-14 md:w-16 group relative"
                  >
                    {/* Tooltip bubble always aligned nicely */}
                    <div 
                      className={clsx(
                        "absolute -top-12 bg-[#111b21] border border-alliance-border rounded-xl px-2.5 py-1.5 text-center transition-all duration-300 shadow-2xl z-20 pointer-events-none flex flex-col items-center gap-0.5",
                        isHovered ? "opacity-100 scale-100 -translate-y-2" : "opacity-0 scale-75 translate-y-0"
                      )}
                    >
                      <span className="text-xs font-black text-white">{count} Leads</span>
                      <span className="text-[9px] font-bold text-alliance-green uppercase font-sans">
                        {totalCourseQueries > 0 ? ((count / totalCourseQueries) * 100).toFixed(0) : 0}% Share
                      </span>
                      {/* Triangle pointer */}
                      <div className="w-2.5 h-2.5 bg-[#111b21] border-r border-b border-alliance-border rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                    </div>

                    {/* Capsule track */}
                    <div className="w-5 sm:w-8 md:w-10 bg-[#ccd0d5]/30 border border-alliance-border h-36 rounded-full flex items-end relative overflow-hidden cursor-pointer">
                      {/* Interactive glowing bar */}
                      <div 
                        className={clsx(
                          "w-full rounded-t-full bg-gradient-to-t transition-all duration-1000 ease-out relative",
                          c.colorFrom,
                          c.colorTo,
                          isHovered ? "scale-x-105" : ""
                        )}
                        style={{ 
                          height: `${percent}%`,
                          boxShadow: isHovered ? `0 0 20px ${c.glowColor}` : 'none'
                        }}
                      >
                        {/* Shimmer light overlay */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-full" />
                      </div>
                    </div>

                    {/* Label */}
                    <span className={clsx(
                      "text-[9px] sm:text-xs font-extrabold mt-3 transition-colors duration-200",
                      isHovered ? "text-alliance-green" : "text-alliance-text"
                    )}>
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Course detail display panel */}
          <div className="mt-6 bg-alliance-dark/60 border border-alliance-border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 relative overflow-hidden min-h-[92px]">
            <div className={clsx(
              "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b",
              activeCourseDetail.colorFrom,
              activeCourseDetail.colorTo
            )} />
            <div className={clsx("p-3 rounded-xl bg-alliance-card text-alliance-text flex-shrink-0 flex items-center justify-center border border-alliance-border shadow-sm")}>
              <activeCourseDetail.icon className="h-5 w-5 text-alliance-green" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-alliance-text tracking-wide uppercase">{activeCourseDetail.fullName}</h4>
              <p className="text-[11px] text-alliance-muted font-medium mt-1 leading-relaxed">{activeCourseDetail.desc}</p>
            </div>
          </div>
        </div>

        {/* Query Categories: High-Fidelity Interactive Donut Chart */}
        <div className="bg-alliance-card border border-alliance-border rounded-2xl p-6 flex flex-col justify-between min-h-[460px] relative overflow-hidden shadow-sm">
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-alliance-text tracking-wide flex items-center gap-2">
                <PieChart className="h-4 w-4 text-alliance-green" />
                Inquiry Channels Analysis
              </h2>
              <span className="text-[10px] text-alliance-green bg-alliance-green/10 px-2 py-0.5 rounded-full font-bold uppercase">AI Classifier</span>
            </div>
            <p className="text-xs text-alliance-muted font-medium mb-6">Topic distributions mapped automatically via AI model webhook categorization.</p>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
            {/* Custom SVG Donut Chart with glowing properties */}
            <div className="w-48 h-48 relative flex-shrink-0 flex items-center justify-center group/donut">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background empty track */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ccd0d5" strokeWidth="2.5" />
                
                {segments.map((seg) => {
                  const isHovered = hoveredCategory === seg.key;
                  return (
                    <circle 
                      key={seg.key}
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="none" 
                      stroke={seg.color} 
                      strokeWidth={isHovered ? "4" : "3"} 
                      strokeDasharray={`${seg.percent} ${100 - seg.percent}`} 
                      strokeDashoffset={`-${seg.offset}`}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 4px ${seg.color})` : 'none',
                        opacity: hoveredCategory && !isHovered ? 0.35 : 1
                      }}
                      onMouseEnter={() => setHoveredCategory(seg.key)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>
              
              {/* High-fidelity Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {hoveredCategory ? (
                  <>
                    <span className="text-2xl font-black text-alliance-text animate-fade-in-quick">
                      {categories[hoveredCategory] || 0}
                    </span>
                    <span className="text-[9px] text-alliance-green font-extrabold uppercase tracking-wider text-center px-2 truncate max-w-[120px]">
                      {hoveredCategory.split(' ')[0]} info
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-alliance-text">{totalCategoryQueries}</span>
                    <span className="text-[9px] text-alliance-muted font-bold uppercase tracking-wider">Total Queries</span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Legends Panel */}
            <div className="flex-1 w-full space-y-2">
              {segments.map((seg) => {
                const isHovered = hoveredCategory === seg.key;
                return (
                  <div 
                    key={seg.key}
                    onMouseEnter={() => setHoveredCategory(seg.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={clsx(
                      "flex flex-col p-2.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group",
                      isHovered 
                        ? "bg-alliance-hover/80 border-alliance-green/40 shadow-sm"
                        : "bg-alliance-dark/30 border border-alliance-border hover:border-alliance-border/70"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", seg.bgClass, seg.shadowClass)} />
                        <span className={clsx("text-xs font-bold transition-colors duration-200", isHovered ? "text-alliance-green" : "text-alliance-text")}>
                          {seg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-alliance-text">{seg.val}</span>
                        <span className="text-[10px] font-semibold text-alliance-muted">({seg.percent.toFixed(0)}%)</span>
                      </div>
                    </div>
                    {/* Expandable mini-description helper */}
                    <div className={clsx(
                      "grid transition-all duration-300 ease-in-out text-[10px] text-alliance-muted pl-5 font-medium leading-relaxed",
                      isHovered ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        {seg.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
