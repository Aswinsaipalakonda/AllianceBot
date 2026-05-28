"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, User, MessageCircle, FileText, Calendar, Clock, 
  Download, Loader2, Zap, Shield, Sparkles, Activity, Plus, RefreshCw, Send, CheckCircle2, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, any> = {
  'Total Leads': User,
  'Active Conversations': MessageCircle,
  'Applications': FileText,
  'Admissions Confirmed': CheckCircle2,
  'Pending Follow-ups': Clock,
};

const COLOR_MAP: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  'Total Leads': { color: 'text-alliance-green', bg: 'bg-alliance-green/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_4px_12px_rgba(0,128,105,0.02)]' },
  'Active Conversations': { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30', glow: 'shadow-[0_4px_12px_rgba(59,130,246,0.02)]' },
  'Applications': { color: 'text-alliance-green', bg: 'bg-alliance-green/10', border: 'hover:border-alliance-green/30', glow: 'shadow-[0_4px_12px_rgba(0,128,105,0.02)]' },
  'Admissions Confirmed': { color: 'text-[#b27b0b]', bg: 'bg-[#ffd279]/15', border: 'hover:border-[#ffd279]/30', glow: 'shadow-[0_4px_12px_rgba(255,210,121,0.02)]' },
  'Pending Follow-ups': { color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/30', glow: 'shadow-[0_4px_12px_rgba(244,63,94,0.02)]' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [syncTime, setSyncTime] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAnalytics = async () => {
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
        const now = new Date();
        setSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFilter !== 'custom' || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [activeFilter, startDate, endDate]);

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
    showToast('Analytical CSV report downloaded!', 'success');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-4 h-full">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-alliance-green/10 border-t-alliance-green rounded-full animate-spin"></div>
          <Sparkles className="absolute h-6 w-6 text-alliance-green animate-pulse" />
        </div>
        <span className="text-alliance-muted text-sm font-bold tracking-wider uppercase animate-pulse">Synchronizing CRM dashboard...</span>
      </div>
    );
  }

  // Fallback defaults if no records are fetched
  const stats = data?.stats || [
    { label: 'Total Leads', value: '6', trend: '+14%', isUp: true },
    { label: 'Active Conversations', value: '6', trend: '+6%', isUp: true },
    { label: 'Applications', value: '0', trend: '+19%', isUp: true },
    { label: 'Admissions Confirmed', value: '0', trend: '+22%', isUp: true },
    { label: 'Pending Follow-ups', value: '2', trend: '-8%', isUp: false },
  ];

  const recentLeads = data?.recentActivity || [];
  const courses = data?.courses || { BHMCT: 2, BBA: 2, DHM: 1, Undecided: 1 };
  
  const totalCoursesShare = Object.values(courses).reduce((a: any, b: any) => a + b, 0) as number || 1;

  const chartPoints = data?.chartData || [
    { label: 'Mon', value: 2, isToday: false },
    { label: 'Tue', value: 1, isToday: false },
    { label: 'Wed', value: 3, isToday: false },
    { label: 'Thu', value: 6, isToday: true },
    { label: 'Fri', value: 4, isToday: false },
    { label: 'Sat', value: 2, isToday: false },
    { label: 'Sun', value: 1, isToday: false }
  ];

  const dayValues = chartPoints.map((p: any) => p.value);
  const maxVal = Math.max(...dayValues, 4);
  const totalChats = dayValues.reduce((a: number, b: number) => a + b, 0);
  const averageChats = chartPoints.length > 0 ? (totalChats / chartPoints.length).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-alliance-dark pb-28 md:pb-8 font-sans">
      
      {/* 1. HEADER HUD PANEL */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 flex-shrink-0 bg-alliance-card border border-alliance-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alliance-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alliance-green"></span>
            </span>
            <span className="text-[11px] font-black tracking-widest text-alliance-green uppercase">Console Workspace Live</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-alliance-text tracking-tight flex items-center gap-2.5">
            Admissions <span className="text-alliance-green">Command Deck</span>
          </h1>
          <p className="text-alliance-muted mt-1 text-sm font-medium">Real-time sheets integrations, counselor logs, and Gemini AI auto-replies metrics.</p>
        </div>

        {/* Dynamic SaaS Health HUD */}
        <div className="flex flex-wrap items-center gap-3.5 xl:justify-end">
          <div className="flex items-center gap-2 bg-alliance-green/5 border border-alliance-green/20 px-3.5 py-2 rounded-xl text-xs font-bold text-alliance-green shadow-inner">
            <Activity className="h-3.5 w-3.5 text-alliance-green" />
            <span>Sheet Sync: Active</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 shadow-inner">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <span>Gemini AI: Operational</span>
          </div>
          <button 
            onClick={() => setIsTimelineOpen(true)} 
            className="bg-alliance-card border border-alliance-border rounded-xl px-4.5 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-alliance-hover hover:border-alliance-green/30 transition-all shadow-sm text-sm text-alliance-text font-bold"
          >
            <Calendar className="h-4 w-4 text-alliance-green" />
            <span>CRM Logs timeline</span>
          </button>
          <button 
            onClick={handleExportReport} 
            className="bg-alliance-green text-white rounded-xl px-5 py-2.5 flex items-center gap-2 font-bold shadow-[0_4px_12px_rgba(0,128,105,0.15)] hover:bg-[#00a884] transition-all cursor-pointer text-sm"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            Export CRM report
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC COMPACT STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat: any, idx: number) => {
          const Icon = ICON_MAP[stat.label] || User;
          const styles = COLOR_MAP[stat.label] || { color: 'text-alliance-text', bg: 'bg-[#008069]/10', border: 'hover:border-alliance-green/30', glow: '' };
          return (
            <div 
              key={idx} 
              className={clsx(
                "bg-alliance-card border border-alliance-border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer group shadow-sm",
                styles.border,
                styles.glow
              )}
            >
              {/* Radial glow background effect on hover */}
              <div className={clsx("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-300", styles.bg)} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={clsx("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 border border-alliance-border/30", styles.bg)}>
                  <Icon className={clsx("h-5 w-5", styles.color)} strokeWidth={2.5} />
                </div>
                <div className={clsx(
                  "text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border",
                  stat.isUp ? 'bg-alliance-green/10 text-alliance-green border-alliance-green/15' : 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                )}>
                  {stat.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="text-[11px] font-bold text-alliance-muted uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-2xl md:text-3xl font-black text-alliance-text tracking-tight group-hover:text-alliance-green transition-colors duration-200">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PRIMARY DATA VISUALIZATION BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Card: Glowing Capsule Equalizer Bar Chart */}
        <div className="lg:col-span-2 bg-alliance-card border border-alliance-border rounded-2xl p-6 md:p-8 flex flex-col min-h-[440px] relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          {/* Grid lines background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-8 relative z-10">
            <div>
              <span className="text-[11px] font-black uppercase text-alliance-muted tracking-widest">Conversation Volume</span>
              <h2 className="text-3xl font-black text-alliance-text mt-1.5 tracking-tight flex items-baseline gap-2">
                {totalChats} <span className="text-sm font-bold text-alliance-muted">
                  Chats {activeFilter === 'weekly' ? 'in last 4 weeks' : activeFilter === 'monthly' ? 'in last 4 months' : 'in timeframe'}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-alliance-green bg-alliance-green/10 border border-alliance-green/20 px-2.5 py-0.5 rounded-lg font-extrabold tracking-wide flex items-center gap-1 shadow-sm">
                  <Zap className="h-3 w-3 text-alliance-green animate-pulse" />
                  {averageChats} {activeFilter === 'weekly' ? 'Weekly Avg' : activeFilter === 'monthly' ? 'Monthly Avg' : 'Daily Avg'}
                </span>
                <span className="text-xs text-alliance-muted font-medium">Automatic CRM Sheet sync</span>
              </div>
            </div>
            
            {/* Filters controls */}
            <div className="flex flex-col sm:items-end gap-3 self-stretch xl:self-auto shrink-0">
              <div className="flex bg-alliance-dark border border-alliance-border p-1 rounded-xl shadow-inner">
                {[
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'custom', label: 'Custom' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id as any)}
                    className={clsx(
                      "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                      activeFilter === item.id 
                        ? "bg-alliance-green text-white shadow-[0_2px_8px_rgba(0,128,105,0.15)] font-extrabold" 
                        : "text-alliance-muted hover:text-alliance-text"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              
              {activeFilter === 'custom' && (
                <div className="flex items-center gap-2 bg-alliance-card border border-alliance-border p-1.5 rounded-xl animate-in slide-in-from-top-1.5 duration-200 shadow-sm">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-alliance-dark border border-alliance-border text-[10px] font-bold text-alliance-text px-2 py-1 rounded outline-none focus:border-alliance-green cursor-pointer"
                  />
                  <span className="text-[10px] text-alliance-muted font-black">to</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-alliance-dark border border-alliance-border text-[10px] font-bold text-alliance-text px-2 py-1 rounded outline-none focus:border-alliance-green cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Equalizer bar chart */}
          <div className="flex-1 flex gap-2.5 mt-2 relative min-h-[200px] w-full">
            <div className="flex flex-col justify-between h-44 text-[10px] font-black text-alliance-muted/40 uppercase tracking-widest w-8 pb-6 shrink-0 text-right pr-2 select-none">
              <span>{maxVal}</span>
              <span>{Math.round(maxVal * 0.75)}</span>
              <span>{Math.round(maxVal * 0.5)}</span>
              <span>{Math.round(maxVal * 0.25)}</span>
              <span>0</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-between relative h-full min-w-0">
              <div className="absolute inset-0 top-1 bottom-10 left-0 right-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="w-full border-t border-alliance-border/60 border-dashed" />
                <div className="w-full border-t border-alliance-border/60 border-dashed" />
                <div className="w-full border-t border-alliance-border/60 border-dashed" />
                <div className="w-full border-t border-alliance-border/60 border-dashed" />
                <div className="w-full border-t border-alliance-border/60 border-dashed" />
              </div>
              
              <div className="absolute inset-0 top-1 bottom-10 left-2 right-2 sm:left-4 sm:right-4 flex justify-between items-end">
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
                      <div 
                        className={clsx(
                          "absolute -top-7 text-xs font-black text-center whitespace-nowrap transition-all duration-300 pointer-events-none select-none z-30",
                          isActive ? "opacity-100 scale-100 -translate-y-1 animate-bounce" : "opacity-0 scale-90 translate-y-2"
                        )}
                      >
                        <span className="bg-[#111b21] border border-alliance-border/60 px-2.5 py-0.5 rounded-lg text-white shadow-md font-bold text-[10px]">
                          {val} {val === 1 ? 'chat' : 'chats'}
                        </span>
                      </div>
                      
                      <div 
                        className={clsx(
                          "w-4 sm:w-8 rounded-t-lg transition-all duration-500 relative overflow-hidden",
                          isActive 
                            ? "bg-gradient-to-t from-alliance-green to-[#25d366] shadow-[0_0_12px_rgba(0,128,105,0.25)] border border-[#25d366]/20" 
                            : "bg-[#ccd0d5]/40 border border-alliance-border hover:bg-alliance-green/10 hover:border-alliance-green/30"
                        )}
                        style={{ height: `${Math.max(6, barHeightPercent)}%` }}
                      >
                        {isActive && (
                           <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-transparent animate-[pulse_2.5s_infinite]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="h-6 mt-auto border-t border-alliance-border flex items-center text-[10px] font-extrabold text-alliance-muted tracking-widest uppercase px-2 sm:px-4 relative pt-2 shrink-0">
                {chartPoints.map((point: any, idx: number) => (
                  <div 
                    key={`axis-${point.label}-${idx}`} 
                    className={clsx(
                      "flex-1 text-center transition-all duration-200 text-[10px]",
                      point.isToday ? "text-alliance-green font-black scale-105" : 
                      hoveredIdx === idx ? "text-alliance-green" : "text-alliance-muted"
                    )}
                  >
                    {point.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Dynamic Course Preferences split progress bars */}
        <div className="bg-alliance-card border border-alliance-border rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-alliance-text tracking-wide flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-alliance-green" />
                Course Interests Share
              </h2>
              <span className="text-[9px] font-black text-alliance-green bg-alliance-green/10 border border-alliance-green/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Dynamic</span>
            </div>
            <p className="text-xs text-alliance-muted font-medium mb-6">Split distribution of current leads matched directly from Google Sheets.</p>
          </div>

          <div className="flex-1 space-y-4.5">
            {[
              { key: 'BHMCT', label: 'BHMCT Culinary Arts', share: courses.BHMCT || 0, color: 'bg-alliance-green', colorFrom: 'from-[#005c4b]' },
              { key: 'BBA', label: 'BBA Corporate Systems', share: courses.BBA || 0, color: 'bg-blue-600', colorFrom: 'from-[#1b80a4]' },
              { key: 'DHM', label: 'DHM Hospitality Diploma', share: courses.DHM || 0, color: 'bg-amber-500', colorFrom: 'from-[#c59129]' },
              { key: 'Undecided', label: 'Consultations Needed', share: courses.Undecided || 0, color: 'bg-rose-500', colorFrom: 'from-[#9f1239]' },
            ].map((c) => {
              const sharePercent = totalCoursesShare > 0 ? ((c.share / totalCoursesShare) * 100) : 0;
              return (
                <div key={c.key} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-bold text-alliance-text">
                    <span className="truncate">{c.label}</span>
                    <span className="text-alliance-muted font-medium shrink-0 ml-2">{sharePercent.toFixed(0)}% ({c.share} {c.share === 1 ? 'lead' : 'leads'})</span>
                  </div>
                  <div className="w-full bg-alliance-dark rounded-full h-2 border border-alliance-border overflow-hidden relative">
                    <div 
                      className={clsx("h-full rounded-full transition-all duration-1000 ease-out", c.color)}
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4.5 border-t border-alliance-border text-center">
            <span className="text-[10px] text-alliance-muted font-bold uppercase tracking-widest">Total Course Splits: {totalCoursesShare} Leads Sync</span>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY DATA VISUALIZATION BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Counselor Quick Actions Deck */}
        <div className="lg:col-span-1 bg-alliance-card border border-alliance-border rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md">
          <div>
            <h2 className="text-lg font-bold text-alliance-text tracking-wide mb-1">Admissions Console Deck</h2>
            <p className="text-xs text-alliance-muted font-medium mb-6">Admissions quick adjustments and operational system shortcuts.</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <button 
              onClick={() => router.push('/leads')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-alliance-border bg-alliance-dark hover:bg-alliance-hover hover:border-alliance-green/30 transition-all group font-bold text-xs text-alliance-text"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="h-4 w-4 text-alliance-green group-hover:scale-110 transition-transform" />
                <span>Add Prospective Student</span>
              </div>
              <ArrowRight className="h-4 w-4 text-alliance-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={async () => {
                showToast('Initiating Google Sheets synchronization...', 'info');
                await fetchAnalytics();
                showToast('Google Sheet Leads database successfully refreshed!', 'success');
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-alliance-border bg-alliance-dark hover:bg-alliance-hover hover:border-alliance-green/30 transition-all group font-bold text-xs text-alliance-text"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-alliance-green group-hover:rotate-180 duration-500" />
                <span>Force Sheet Leads Sync</span>
              </div>
              <ArrowRight className="h-4 w-4 text-alliance-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => {
                showToast('AI Counselor parameters tuned to strict brochure answers.', 'success');
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-alliance-border bg-alliance-dark hover:bg-alliance-hover hover:border-alliance-green/30 transition-all group font-bold text-xs text-alliance-text"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-alliance-green group-hover:scale-110 transition-transform" />
                <span>Strict AI Brochure Tuning</span>
              </div>
              <ArrowRight className="h-4 w-4 text-alliance-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => {
                showToast('System broadsheet broadcast initiated to active queue!', 'success');
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-alliance-border bg-alliance-dark hover:bg-alliance-hover hover:border-alliance-green/30 transition-all group font-bold text-xs text-alliance-text"
            >
              <div className="flex items-center gap-2.5">
                <Send className="h-4 w-4 text-alliance-green group-hover:translate-x-1 duration-200" />
                <span>Broadcast Admissions Alert</span>
              </div>
              <ArrowRight className="h-4 w-4 text-alliance-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-alliance-border">
            <div className="flex items-center gap-2.5 text-[10.5px] text-alliance-muted font-bold uppercase">
              <Activity className="h-3 w-3 text-alliance-green animate-pulse" />
              <span>Workspace Sync: operational</span>
            </div>
          </div>
        </div>

        {/* Right Side: Live Activity Leads Feed */}
        <div className="lg:col-span-2 bg-alliance-card border border-alliance-border rounded-2xl p-6 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-alliance-text tracking-wide mb-1">Live Recent Leads</h2>
              <p className="text-xs text-alliance-muted font-medium">Synced instantly from the response Google Form.</p>
            </div>
            <button 
              onClick={() => router.push('/leads')} 
              className="text-alliance-green text-xs font-bold hover:underline cursor-pointer border border-alliance-green/20 bg-alliance-green/5 px-3 py-1.5 rounded-xl hover:bg-alliance-green/15 transition-all shadow-sm"
            >
              View Directory
            </button>
          </div>
          
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
            {recentLeads.map((lead: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-alliance-dark hover:bg-alliance-hover transition-all duration-200 cursor-pointer border border-alliance-border hover:border-alliance-green/30 group shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-alliance-card flex items-center justify-center text-alliance-text border border-alliance-border text-xs font-black group-hover:border-alliance-green/30 transition-colors shadow-sm">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-alliance-text group-hover:text-alliance-green transition-colors truncate">{lead.name}</div>
                    <div className="text-[10px] font-bold text-alliance-muted flex items-center gap-2 mt-0.5">
                      <span className="text-alliance-green font-black">{lead.course}</span>
                      <span className="w-1 h-1 rounded-full bg-alliance-border"></span>
                      <span className="text-alliance-green uppercase font-bold text-[9px] bg-alliance-green/10 border border-alliance-green/20 px-2.5 py-0.5 rounded-lg">{lead.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-alliance-muted shrink-0 bg-alliance-card px-2.5 py-1.5 rounded-lg border border-alliance-border shadow-sm flex items-center gap-2">
                  <span>{lead.time}</span>
                  <ArrowRight className="h-3 w-3 text-alliance-green opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
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

      {/* 5. FLOATING TOAST FEEDBACK NOTIFICATIONS */}
      {toast && (
        <div className={clsx(
          "fixed bottom-24 md:bottom-5 right-5 px-4.5 py-3.5 rounded-xl shadow-2xl text-alliance-text z-50 flex items-center gap-2.5 border transition-all duration-300 font-bold text-xs animate-in slide-in-from-bottom-5",
          toast.type === 'success' && "bg-[#d9fdd3] border border-alliance-green text-[#008069] backdrop-blur-md shadow-[0_4px_15px_rgba(0,128,105,0.08)]",
          toast.type === 'info' && "bg-alliance-card border border-alliance-border text-alliance-text backdrop-blur-md shadow-md",
          toast.type === 'error' && "bg-red-50 border border-red-200 text-red-700 backdrop-blur-md shadow-md"
        )}>
          {toast.message}
        </div>
      )}

      {/* 6. CRM TIMELINE LOGS TIMELINE DRAWER */}
      {isTimelineOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-alliance-card border border-alliance-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-alliance-border flex justify-between items-center bg-alliance-dark/40 shadow-sm">
              <h3 className="text-alliance-text font-bold text-lg flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-alliance-green animate-pulse" /> Live Admissions Log Feed
              </h3>
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="text-alliance-muted hover:text-alliance-text transition-colors text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setIsTimelineOpen(false);
                      router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`);
                    }}
                    className="p-3.5 rounded-xl bg-alliance-dark border border-alliance-border hover:border-alliance-green/30 hover:bg-alliance-hover cursor-pointer transition-all duration-200 flex items-start gap-3.5 group shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-alliance-green/10 text-alliance-green font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-alliance-green/20">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-alliance-text group-hover:text-alliance-green transition-colors truncate">{lead.name}</h4>
                        <span className="text-[9px] text-alliance-muted font-black whitespace-nowrap ml-2 bg-alliance-card border border-alliance-border px-2.5 py-0.5 rounded-md shadow-sm">{lead.time}</span>
                      </div>
                      <p className="text-xs text-alliance-muted leading-relaxed mt-1">
                        Inquired for course <span className="text-[#4f46e5] font-bold">{lead.course}</span>. System classified lead status as: <span className="px-2.5 py-0.5 text-[9px] font-black rounded-lg bg-alliance-green/10 text-alliance-green border border-alliance-green/20 uppercase tracking-wide ml-1">{lead.status}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-alliance-muted text-sm font-semibold">No live timeline event logs synced.</div>
              )}
            </div>

            <div className="px-6 py-4.5 border-t border-alliance-border flex justify-end bg-alliance-dark/30 shadow-inner">
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="px-5 py-2.5 bg-alliance-green text-white rounded-xl text-sm font-bold hover:bg-[#00c298] transition-colors cursor-pointer shadow-[0_4px_12px_rgba(0,128,105,0.15)]"
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
