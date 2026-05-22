"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, User, MessageCircle, FileText, Calendar, Clock, Download, Loader2, Zap
} from 'lucide-react';
import clsx from 'clsx';

import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, any> = {
  'Total Leads': User,
  'Active Conversations': MessageCircle,
  'Applications': FileText,
  'Admissions Confirmed': FileText,
  'Pending Follow-ups': Clock,
};

const COLOR_MAP: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  'Total Leads': { color: 'text-alliance-green', bg: 'bg-[#00a884]/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_0_20px_rgba(0,168,132,0.02)]' },
  'Active Conversations': { color: 'text-[#53bdeb]', bg: 'bg-[#53bdeb]/10', border: 'hover:border-[#53bdeb]/30', glow: 'shadow-[0_0_20px_rgba(83,189,235,0.02)]' },
  'Applications': { color: 'text-alliance-green', bg: 'bg-[#00a884]/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_0_20px_rgba(0,168,132,0.02)]' },
  'Admissions Confirmed': { color: 'text-[#ffd279]', bg: 'bg-[#ffd279]/10', border: 'hover:border-[#ffd279]/30', glow: 'shadow-[0_0_20px_rgba(255,210,121,0.02)]' },
  'Pending Follow-ups': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'hover:border-red-400/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.02)]' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportReport = () => {
    if (!data) return;
    const statsText = data.stats.map((s: any) => `"${s.label}","${s.value}","${s.trend}"`).join('\n');
    const activityText = data.recentActivity.map((r: any) => `"${r.name}","${r.phone}","${r.course}","${r.status}","${r.time}"`).join('\n');
    
    const headers = 'Alliance College Admissions Report\n\nMetric,Current Value,Week-over-Week Trend\n' + statsText + 
      '\n\nRecent Activity Leads\nName,Phone,Course,Lead Status,Time Logged\n' + activityText;
      
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `admissions_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytical report downloaded!', 'success');
  };

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Synchronizing CRM dashboard metrics...</span>
      </div>
    );
  }

  // Fallback defaults if no records are fetched
  const stats = data?.stats || [
    { label: 'Total Leads', value: '0', trend: '0%', isUp: true },
    { label: 'Active Conversations', value: '0', trend: '0%', isUp: true },
    { label: 'Applications', value: '0', trend: '0%', isUp: true },
    { label: 'Admissions Confirmed', value: '0', trend: '0%', isUp: true },
    { label: 'Pending Follow-ups', value: '0', trend: '0%', isUp: false },
  ];

  const recentLeads = data?.recentActivity || [];

  // Weekday data aggregation & coordinates calculation for premium custom SVG Bezier chart
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayValues = weekdays.map(day => data?.dayCounts?.[day] ?? 0);
  const maxVal = Math.max(...dayValues, 4); // dynamic peak scale (minimum threshold of 4 for visually robust grid spacing)
  
  // Dynamically calculate today's index in our Mon-Sun sequence (Mon=0, Tue=1, ..., Sun=6)
  const todayNum = new Date().getDay();
  const currentDayIdx = todayNum === 0 ? 6 : todayNum - 1;
  
  const getY = (val: number) => {
    const ratio = val / maxVal;
    return 165 - ratio * 130; // maps 0 value to 165px baseline, maxVal to 35px peak
  };

  // Generate cubic Bezier coordinate path using a mathematical midpoint S-curve algorithm
  let pathD = '';
  if (dayValues.length > 0) {
    pathD = `M 0 ${getY(dayValues[0])}`;
    for (let i = 0; i < dayValues.length - 1; i++) {
      const xLeft = (i * 500) / 6;
      const xRight = ((i + 1) * 500) / 6;
      const yLeft = getY(dayValues[i]);
      const yRight = getY(dayValues[i + 1]);
      
      const cp1x = xLeft + (xRight - xLeft) / 2;
      const cp1y = yLeft;
      const cp2x = cp1x;
      const cp2y = yRight;
      
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xRight} ${yRight}`;
    }
  }

  // Create area fill path that matches the Bezier curve precisely and drops to the baseline
  const areaD = dayValues.length > 0
    ? `M 0 200 L 0 ${getY(dayValues[0])} ` + (pathD.includes('C') ? pathD.substring(pathD.indexOf('C')) : '') + ` L 500 200 Z`
    : '';

  const totalChats = dayValues.reduce((a, b) => a + b, 0);
  const averageChats = (totalChats / 7).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-alliance-dark pb-24 md:pb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Admissions <span className="text-alliance-green">Overview</span>
          </h1>
          <p className="text-alliance-muted mt-1 text-sm font-medium">Monitor your CRM performance and lead analytics from Google Sheets in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div 
            onClick={() => setIsTimelineOpen(true)} 
            className="bg-alliance-card/80 border border-alliance-border/60 backdrop-blur-md rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-alliance-hover/60 hover:border-alliance-green/30 transition-all duration-200"
          >
            <Calendar className="h-4 w-4 text-alliance-green animate-pulse" />
            <span className="text-sm text-alliance-text font-semibold">Live CRM Timeline</span>
          </div>
          <button 
            onClick={handleExportReport} 
            className="bg-alliance-green text-[#092b1d] rounded-xl px-4 py-2.5 flex items-center gap-2 font-bold shadow-[0_4px_20px_rgba(0,168,132,0.2)] hover:bg-[#00c298] hover:shadow-[0_4px_25px_rgba(0,168,132,0.35)] transition-all duration-300 cursor-pointer"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            Export CRM Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat: any, idx: number) => {
          const Icon = ICON_MAP[stat.label] || User;
          const styles = COLOR_MAP[stat.label] || { color: 'text-white', bg: 'bg-white/10', border: 'hover:border-white/50', glow: '' };
          return (
            <div 
              key={idx} 
              className={clsx(
                "bg-gradient-to-br from-[#111b21] to-[#0b141a] border border-alliance-border/70 rounded-2xl p-5 flex flex-col relative overflow-hidden backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer group",
                styles.border,
                styles.glow
              )}
            >
              {/* Radial glow on card hover */}
              <div className={clsx("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-35 transition-opacity duration-300", styles.bg)} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={clsx("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110", styles.bg)}>
                  <Icon className={clsx("h-5 w-5", styles.color)} strokeWidth={2.5} />
                </div>
                <div className={clsx(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-md",
                  stat.isUp ? 'bg-[#00a884]/10 text-alliance-green' : 'bg-red-500/10 text-red-400'
                )}>
                  {stat.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-alliance-muted uppercase tracking-wider mb-1.5 relative z-10">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight relative z-10 group-hover:text-alliance-green transition-colors duration-200">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Redesigned Dynamic Premium SVG Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111b21] to-[#070c0e] border border-alliance-border/70 rounded-2xl p-6 flex flex-col min-h-[420px] backdrop-blur-md relative overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          {/* Neon corner flare */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-alliance-green/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Conversation Volume</h2>
                <div className="flex items-center gap-1.5 bg-[#00a884]/15 px-2 py-0.5 rounded-full border border-alliance-green/20 text-[9px] text-alliance-green font-extrabold uppercase tracking-wide">
                  <Zap className="h-2.5 w-2.5 text-alliance-green animate-pulse" /> Live Syncing
                </div>
              </div>
              <p className="text-xs text-alliance-muted font-medium mt-1">Real-time incoming student traffic metrics from Google Sheets</p>
            </div>
            
            <div className="flex items-center gap-4 bg-alliance-dark/50 border border-alliance-border/50 px-4 py-2 rounded-xl backdrop-blur-sm self-start sm:self-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-alliance-muted font-bold uppercase tracking-wider">Weekly Volume</span>
                <span className="text-base font-extrabold text-white">{totalChats} chats</span>
              </div>
              <div className="h-6 w-px bg-alliance-border/50" />
              <div className="flex flex-col">
                <span className="text-[10px] text-alliance-muted font-bold uppercase tracking-wider">Daily Avg</span>
                <span className="text-base font-extrabold text-alliance-green">{averageChats}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between relative mt-2 min-h-[220px]">
            {/* Custom SVG Line Chart with Premium Gradients & Cyber Styling */}
            <div className="w-full h-64 relative">
              {/* Dynamic Interactive HTML Floating Card Tooltip */}
              {hoveredIdx !== null && (
                <div 
                  className="absolute pointer-events-none bg-[#111b21]/95 border border-alliance-green/40 rounded-xl p-3 shadow-2xl backdrop-blur-md z-40 transition-all duration-150 w-36 font-sans text-left"
                  style={{
                    left: `calc(${(hoveredIdx * 100) / 6}% - 72px)`,
                    top: `${Math.max(10, getY(dayValues[hoveredIdx]) - 80)}px`,
                  }}
                >
                  {/* Tooltip caret */}
                  <div className="absolute bottom-[-6px] left-[calc(50%-6px)] w-3 h-3 bg-[#111b21] border-r border-b border-alliance-green/40 rotate-45" />
                  
                  <div className="text-[10px] font-extrabold text-alliance-muted uppercase tracking-wider">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][hoveredIdx]}
                  </div>
                  <div className="text-sm font-black text-white mt-1">
                    {dayValues[hoveredIdx]} {dayValues[hoveredIdx] === 1 ? 'chat' : 'chats'}
                  </div>
                  <div className="text-[9px] text-alliance-green font-bold mt-0.5">
                    {totalChats > 0 ? `${((dayValues[hoveredIdx] / totalChats) * 100).toFixed(0)}% of weekly load` : '0% of weekly load'}
                  </div>
                </div>
              )}

              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00a884" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#00a884" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#00a884" stopOpacity="0.0" />
                  </linearGradient>
                  
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#25d366" />
                    <stop offset="50%" stopColor="#00a884" />
                    <stop offset="100%" stopColor="#05c49b" />
                  </linearGradient>

                  <linearGradient id="column-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00a884" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#00a884" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="today-column-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#25d366" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#25d366" stopOpacity="0.0" />
                  </linearGradient>
                  
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="0" y1="35" x2="500" y2="35" stroke="#222e35" strokeOpacity="0.45" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#222e35" strokeOpacity="0.45" strokeDasharray="4 4" />
                <line x1="0" y1="165" x2="500" y2="165" stroke="#222e35" strokeOpacity="0.45" strokeDasharray="4 4" />

                {/* Inline Axis text labels for professional telemetry detail */}
                <text x="495" y="30" textAnchor="end" className="fill-alliance-muted/40 text-[8px] font-extrabold uppercase tracking-widest pointer-events-none">Peak ({maxVal})</text>
                <text x="495" y="95" textAnchor="end" className="fill-alliance-muted/40 text-[8px] font-extrabold uppercase tracking-widest pointer-events-none">Mid ({Math.round(maxVal / 2)})</text>
                <text x="495" y="160" textAnchor="end" className="fill-alliance-muted/40 text-[8px] font-extrabold uppercase tracking-widest pointer-events-none">Baseline (0)</text>

                {/* Vertical Grid Lines at Day Steps */}
                {weekdays.map((_, idx) => {
                  const x = (idx * 500) / 6;
                  return (
                    <line 
                      key={`v-grid-${idx}`} 
                      x1={x} 
                      y1="25" 
                      x2={x} 
                      y2="175" 
                      stroke="#222e35" 
                      strokeOpacity={hoveredIdx === idx ? "0.6" : "0.2"} 
                      strokeWidth={hoveredIdx === idx ? "1.5" : "1"}
                      strokeDasharray="3 3"
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Column highlights (Backdrops) */}
                {weekdays.map((_, idx) => {
                  const x = (idx * 500) / 6;
                  const isHovered = hoveredIdx === idx;
                  const isToday = idx === currentDayIdx;
                  
                  if (!isHovered && !isToday) return null;
                  
                  return (
                    <rect 
                      key={`col-bg-${idx}`}
                      x={x - 28} 
                      y="15" 
                      width="56" 
                      height="180" 
                      rx="8"
                      fill={isHovered ? "url(#column-grad)" : "url(#today-column-grad)"}
                      stroke={isHovered ? "rgba(0, 168, 132, 0.18)" : "rgba(37, 211, 102, 0.05)"}
                      strokeWidth="1"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  );
                })}

                {/* Area under the dynamic curve */}
                {areaD && (
                  <path 
                    d={areaD} 
                    fill="url(#chart-glow)" 
                    className="animate-in fade-in duration-500"
                  />
                )}

                {/* Glowing neon halo backer line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#line-grad)" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    opacity="0.25"
                    filter="url(#neon-glow)"
                    className="animate-in fade-in duration-500"
                  />
                )}

                {/* Main Glowing S-Curve Bezier Line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#line-grad)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="animate-in fade-in duration-500"
                  />
                )}

                {/* Dynamic Hover Vertical Column Guides */}
                {hoveredIdx !== null && (
                  <g className="pointer-events-none">
                    <line 
                      x1={(hoveredIdx * 500) / 6} 
                      y1="20" 
                      x2={(hoveredIdx * 500) / 6} 
                      y2="190" 
                      stroke="#00a884" 
                      strokeOpacity="0.3" 
                      strokeWidth="1.5" 
                    />
                    <circle 
                      cx={(hoveredIdx * 500) / 6} 
                      cy={getY(dayValues[hoveredIdx])} 
                      r="12" 
                      fill="#00a884" 
                      fillOpacity="0.15" 
                      className="animate-ping origin-center"
                    />
                  </g>
                )}

                {/* Interactive Points Grid */}
                {weekdays.map((day, idx) => {
                  const x = (idx * 500) / 6;
                  const val = dayValues[idx];
                  const y = getY(val);
                  const isHovered = hoveredIdx === idx;
                  const isToday = idx === currentDayIdx;
                  return (
                    <g 
                      key={`point-${day}`} 
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="cursor-pointer"
                    >
                      {/* Transparent larger hover catcher */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="22" 
                        fill="transparent" 
                      />
                      
                      {/* Ambient Glow Outer Ring */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? "9" : isToday ? "8" : "6"} 
                        fill={isHovered ? "rgba(37, 211, 102, 0.22)" : isToday ? "rgba(0, 168, 132, 0.15)" : "rgba(0, 168, 132, 0.05)"}
                        stroke={isHovered ? "#25d366" : isToday ? "#00a884" : "#222d34"}
                        strokeWidth={isHovered ? "1.5" : isToday ? "1.5" : "1"}
                        className="transition-all duration-300 transform origin-center"
                      />

                      {/* Crisp Inner Dot */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? "4" : isToday ? "3.5" : "3"} 
                        fill={isHovered ? "#ffffff" : isToday ? "#25d366" : "#0b141a"}
                        stroke={isToday || isHovered ? "none" : "#00a884"}
                        strokeWidth={isToday || isHovered ? "0" : "1.5"}
                        className="transition-all duration-300 transform origin-center"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis labels with active highlights */}
            <div className="flex justify-between text-[11px] font-bold mt-2 border-t border-[#222e35]/50 pt-3 relative z-10">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const isToday = idx === currentDayIdx;
                const label = isToday ? `${day} (Today)` : day;
                return (
                  <span 
                    key={day} 
                    className={clsx(
                      "transition-all duration-200 px-2 py-0.5 rounded-md",
                      isToday ? "text-[#25d366] bg-[#00a884]/15 border border-[#00a884]/35 shadow-[0_0_10px_rgba(0,168,132,0.1)] font-extrabold" : 
                      hoveredIdx === idx ? "text-alliance-green bg-[#00a884]/10 scale-105" : "text-alliance-muted"
                    )}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Recent Activity */}
        <div className="bg-gradient-to-br from-[#111b21] to-[#070c0e] border border-alliance-border/70 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide">Recent Leads</h2>
            <button 
              onClick={() => router.push('/leads')} 
              className="text-alliance-green text-xs font-bold hover:underline cursor-pointer border border-[#00a884]/20 bg-[#00a884]/5 px-3 py-1.5 rounded-xl hover:bg-[#00a884]/15 transition-all"
            >
              View All
            </button>
          </div>
          
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[340px] pr-1">
            {recentLeads.map((lead: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#122027]/40 hover:bg-[#122027]/90 transition-all duration-200 cursor-pointer border border-alliance-border/40 hover:border-alliance-green/30 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-alliance-dark flex items-center justify-center text-white border border-alliance-border/60 text-xs font-black group-hover:border-alliance-green/30 transition-colors">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-alliance-green transition-colors truncate">{lead.name}</div>
                    <div className="text-[10px] font-semibold text-alliance-muted flex items-center gap-2 mt-0.5">
                      <span className="text-[#a5b4fc]">{lead.course}</span>
                      <span className="w-1 h-1 rounded-full bg-alliance-border"></span>
                      <span className="text-alliance-green uppercase font-bold text-[9px] bg-[#00a884]/10 px-1 rounded">{lead.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-alliance-muted shrink-0 bg-alliance-dark/60 px-2 py-0.5 rounded-lg border border-alliance-border">{lead.time}</div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-alliance-muted text-sm py-16 gap-2">
                <Loader2 className="h-6 w-6 text-alliance-muted animate-spin" />
                <span>No recent lead activity logged in Sheets.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={clsx(
          "fixed bottom-24 md:bottom-5 right-5 px-4 py-3.5 rounded-xl shadow-2xl text-white z-50 flex items-center gap-2.5 border transition-all duration-300 font-bold text-xs animate-in slide-in-from-bottom-5",
          toast.type === 'success' && "bg-[#092b1d]/90 border-alliance-green text-alliance-green backdrop-blur-md shadow-[0_0_20px_rgba(0,168,132,0.2)]",
          toast.type === 'info' && "bg-alliance-card/90 border-alliance-border text-alliance-text backdrop-blur-md",
          toast.type === 'error' && "bg-red-950/90 border-red-500 text-red-400 backdrop-blur-md"
        )}>
          {toast.message}
        </div>
      )}

      {/* CRM Timeline Drawer Modal */}
      {isTimelineOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#111b21] to-[#0b141a] border border-alliance-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-alliance-border flex justify-between items-center bg-[#122027]/40">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-alliance-green animate-pulse" /> Live Admissions Log Feed
              </h3>
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="text-alliance-muted hover:text-white transition-colors text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 pr-2">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setIsTimelineOpen(false);
                      router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`);
                    }}
                    className="p-3.5 rounded-xl bg-[#122027]/30 border border-alliance-border/50 hover:border-alliance-green/30 hover:bg-[#122027]/75 cursor-pointer transition-all duration-200 flex items-start gap-3.5 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-alliance-green/10 text-alliance-green font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-alliance-green/10">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-alliance-green transition-colors truncate">{lead.name}</h4>
                        <span className="text-[9px] text-alliance-muted font-black whitespace-nowrap ml-2 bg-alliance-dark border border-alliance-border/45 px-2 py-0.5 rounded-md">{lead.time}</span>
                      </div>
                      <p className="text-xs text-alliance-muted leading-relaxed">
                        Inquired for course <span className="text-[#a5b4fc] font-bold">{lead.course}</span>. System classified lead status as: <span className="px-2 py-0.5 text-[9px] font-black rounded-lg bg-[#00a884]/10 text-alliance-green border border-alliance-green/10 uppercase tracking-wide ml-1">{lead.status}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-alliance-muted text-sm font-semibold">No live timeline event logs synced.</div>
              )}
            </div>

            <div className="px-6 py-4.5 border-t border-alliance-border/50 flex justify-end bg-alliance-dark/20">
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="px-5 py-2.5 bg-alliance-green text-[#092b1d] rounded-xl text-sm font-bold hover:bg-[#00c298] transition-colors cursor-pointer shadow-[0_4px_15px_rgba(0,168,132,0.2)]"
              >
                Close Logs Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
