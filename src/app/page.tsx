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

  const [activeFilter, setActiveFilter] = useState<'weekly' | 'monthly' | 'annual' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        let url = `/api/analytics?filter=${activeFilter}`;
        if (activeFilter === 'custom' && startDate && endDate) {
          url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
        }
        const res = await fetch(url);
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
    
    if (activeFilter !== 'custom' || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [activeFilter, startDate, endDate]);

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

  const chartPoints = data?.chartData || [
    { label: 'Mon', value: 0, detailLabel: 'Monday' },
    { label: 'Tue', value: 0, detailLabel: 'Tuesday' },
    { label: 'Wed', value: 0, detailLabel: 'Wednesday' },
    { label: 'Thu', value: 0, detailLabel: 'Thursday' },
    { label: 'Fri', value: 0, detailLabel: 'Friday' },
    { label: 'Sat', value: 0, detailLabel: 'Saturday' },
    { label: 'Sun', value: 0, detailLabel: 'Sunday' }
  ];

  const dayValues = chartPoints.map((p: any) => p.value);
  const maxVal = Math.max(...dayValues, 4);
  
  const getY = (val: number) => {
    const ratio = val / maxVal;
    return 165 - ratio * 130; // maps 0 value to 165px baseline, maxVal to 35px peak
  };

  const totalChats = dayValues.reduce((a: number, b: number) => a + b, 0);
  const averageChats = chartPoints.length > 0 ? (totalChats / chartPoints.length).toFixed(1) : '0.0';


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
        {/* Consolidated premium dynamic Bar Chart card, perfectly matching the design mock */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111b21] to-[#070c0e] border border-alliance-border/70 rounded-3xl p-6 md:p-8 flex flex-col min-h-[440px] backdrop-blur-md relative overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {/* Subtle neon glow backdrops */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-alliance-green/5 blur-3xl pointer-events-none" />
          
          {/* Header section designed exactly like the mock with active filters */}
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-8 relative z-10">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold uppercase text-alliance-muted tracking-widest">Conversation Volume</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 tracking-tight flex items-baseline gap-2">
                {totalChats} <span className="text-lg font-bold text-alliance-muted">
                  Chats {activeFilter === 'weekly' ? 'this week' : activeFilter === 'monthly' ? 'this month' : activeFilter === 'annual' ? 'this year' : 'in timeframe'}
                </span>
              </h2>
              {/* Daily Average details */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-alliance-green bg-[#00a884]/10 border border-[#00a884]/20 px-2.5 py-1 rounded-lg font-extrabold tracking-wide flex items-center gap-1">
                  <Zap className="h-3 w-3 text-alliance-green animate-pulse" />
                  {averageChats} {activeFilter === 'annual' ? 'Monthly Avg' : 'Daily Avg'}
                </span>
                <span className="text-xs text-alliance-muted font-medium">Automatic CRM Sheet sync</span>
              </div>
            </div>
            
            {/* Timeframe Filters Controls */}
            <div className="flex flex-col sm:items-end gap-3 self-stretch xl:self-auto">
              <div className="flex flex-wrap bg-alliance-dark/80 p-1 rounded-xl border border-alliance-border/60">
                {[
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'annual', label: 'Annual' },
                  { id: 'custom', label: 'Custom' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id as any)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer",
                      activeFilter === item.id 
                        ? "bg-alliance-green text-[#092b1d] shadow-[0_2px_10px_rgba(0,168,132,0.2)]" 
                        : "text-alliance-muted hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Date Range picker */}
              {activeFilter === 'custom' && (
                <div className="flex flex-wrap items-center gap-2 bg-[#122027]/70 border border-alliance-border/40 p-2 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-alliance-dark border border-alliance-border/60 text-xs text-white px-2 py-1 rounded outline-none focus:border-alliance-green cursor-pointer"
                  />
                  <span className="text-xs text-alliance-muted font-bold">to</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-alliance-dark border border-alliance-border/60 text-xs text-white px-2 py-1 rounded outline-none focus:border-alliance-green cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* The main responsive grid card */}
          <div className="flex-1 flex gap-2 sm:gap-4 mt-2 relative min-h-[260px] w-full">
            
            {/* Y-Axis labels (left side, like the mock) */}
            <div className="flex flex-col justify-between h-48 text-[10px] font-extrabold text-alliance-muted/40 uppercase tracking-widest w-12 pb-6 shrink-0 select-none text-right pr-2">
              <span>{maxVal}</span>
              <span>{Math.round(maxVal * 0.75)}</span>
              <span>{Math.round(maxVal * 0.5)}</span>
              <span>{Math.round(maxVal * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 flex flex-col justify-between relative h-full min-w-0">
              
              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 top-1 bottom-10 left-0 right-0 flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full border-t border-[#222e35]/30 border-dashed" />
                <div className="w-full border-t border-[#222e35]/30 border-dashed" />
                <div className="w-full border-t border-[#222e35]/30 border-dashed" />
                <div className="w-full border-t border-[#222e35]/30 border-dashed" />
                <div className="w-full border-t border-[#222e35]/30 border-dashed" />
              </div>
              
              {/* Bars Row */}
              <div className="absolute inset-0 top-1 bottom-10 left-2 right-2 sm:left-4 sm:right-4 flex justify-between items-end z-10">
                {chartPoints.map((point: any, idx: number) => {
                  const val = point.value;
                  const isActive = hoveredIdx === idx || (hoveredIdx === null && point.isToday);
                  const barHeightPercent = (val / maxVal) * 100;
                  
                  return (
                    <div 
                      key={`bar-group-${point.label}-${idx}`}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer relative"
                    >
                      {/* Value label directly above active bar */}
                      <div 
                        className={clsx(
                          "absolute -top-7 text-xs font-black text-center whitespace-nowrap transition-all duration-300 pointer-events-none select-none z-30",
                          isActive ? "opacity-100 scale-100 -translate-y-1 text-white font-extrabold animate-bounce" : "opacity-0 scale-90 translate-y-2"
                        )}
                      >
                        <span className="bg-[#111b21] border border-[#00a884]/45 px-2 py-0.5 rounded-md text-[#00a884] shadow-lg">
                          {val} {val === 1 ? 'chat' : 'chats'}
                        </span>
                      </div>
                      
                      {/* The Bar itself */}
                      <div 
                        className={clsx(
                          "w-5 sm:w-8 md:w-10 rounded-t-lg sm:rounded-t-xl transition-all duration-500 relative overflow-hidden",
                          isActive 
                            ? "bg-gradient-to-t from-[#005c4b] via-[#00a884] to-[#25d366] shadow-[0_0_20px_rgba(0,168,132,0.45)] border border-[#25d366]/30" 
                            : "bg-[#202c33]/45 border border-[#2d3b45]/30 hover:bg-[#00a884]/15 hover:border-[#00a884]/35"
                        )}
                        style={{ height: `${Math.max(6, barHeightPercent)}%` }}
                      >
                        {/* Shimmer gradient on active bar */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-transparent animate-[pulse_2s_infinite]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* X-Axis labels */}
              <div className="h-6 mt-auto border-t border-[#222e35]/50 flex justify-between items-center text-[10px] sm:text-[11px] font-extrabold text-alliance-muted tracking-wide px-2 sm:px-4 relative z-20 pt-2 shrink-0">
                {chartPoints.map((point: any, idx: number) => {
                  const isToday = point.isToday;
                  const isHovered = hoveredIdx === idx;
                  return (
                    <div 
                      key={`axis-${point.label}-${idx}`} 
                      className={clsx(
                        "w-12 text-center transition-all duration-200 truncate",
                        isToday ? "text-[#25d366] font-black scale-105" : 
                        isHovered ? "text-[#00a884]" : "text-alliance-muted"
                      )}
                    >
                      {point.label}
                    </div>
                  );
                })}
              </div>
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
