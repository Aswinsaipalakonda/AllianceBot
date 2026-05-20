"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, User, MessageCircle, FileText, Calendar, Clock, Download, Loader2
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

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  'Total Leads': { color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
  'Active Conversations': { color: 'text-[#53bdeb]', bg: 'bg-[#53bdeb]/10' },
  'Applications': { color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
  'Admissions Confirmed': { color: 'text-[#ffd279]', bg: 'bg-[#ffd279]/10' },
  'Pending Follow-ups': { color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

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

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 bg-alliance-dark">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Admissions Overview</h1>
          <p className="text-alliance-muted mt-1 text-sm">Monitor your CRM performance and lead analytics from Google Sheets.</p>
        </div>
        <div className="flex gap-4">
          <div onClick={() => setIsTimelineOpen(true)} className="bg-alliance-card border border-alliance-border rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-alliance-hover transition-colors">
            <Calendar className="h-4 w-4 text-alliance-muted" />
            <span className="text-sm text-alliance-text">Live CRM Timeline</span>
          </div>
          <button onClick={handleExportReport} className="bg-alliance-green text-[#111b21] rounded-lg px-4 py-2 flex items-center gap-2 font-medium hover:bg-[#00c298] transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            Export CRM Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat: any, idx: number) => {
          const Icon = ICON_MAP[stat.label] || User;
          const styles = COLOR_MAP[stat.label] || { color: 'text-white', bg: 'bg-white/10' };
          return (
            <div key={idx} className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex flex-col relative overflow-hidden hover:border-alliance-green/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-2.5 rounded-lg", styles.bg)}>
                  <Icon className={clsx("h-5 w-5", styles.color)} />
                </div>
                <div className="text-xs font-medium flex items-center gap-1">
                  {stat.isUp ? <TrendingUp className="h-3.5 w-3.5 text-alliance-green" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                  <span className={stat.isUp ? 'text-alliance-green' : 'text-red-400'}>{stat.trend}</span>
                </div>
              </div>
              <div className="text-sm text-alliance-muted mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Premium SVG Chart */}
        <div className="lg:col-span-2 bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-6">Conversation Volume</h2>
          <div className="flex-1 flex flex-col justify-between relative">
            
            {/* Custom SVG Line Chart with Gradients */}
            <div className="w-full h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00a884" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#00a884" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#222e35" strokeDasharray="3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#222e35" strokeDasharray="3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#222e35" strokeDasharray="3" />

                {/* Fill Path (Area under line) */}
                <path 
                  d="M 0 200 L 0 160 L 80 120 L 160 145 L 240 85 L 320 110 L 400 50 L 500 35 L 500 200 Z" 
                  fill="url(#chart-glow)" 
                />

                {/* Main Smooth Line */}
                <path 
                  d="M 0 160 Q 40 140, 80 120 T 160 145 T 240 85 T 320 110 T 400 50 T 500 35" 
                  fill="none" 
                  stroke="#00a884" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="80" cy="120" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
                <circle cx="160" cy="145" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
                <circle cx="240" cy="85" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
                <circle cx="320" cy="110" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
                <circle cx="400" cy="50" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
                <circle cx="500" cy="35" r="5" fill="#00a884" stroke="#0b141a" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-xs text-alliance-muted mt-2 border-t border-[#222e35] pt-3">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun (Today)</span>
            </div>
          </div>
        </div>

        {/* Live Recent Activity */}
        <div className="bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
            <button onClick={() => router.push('/leads')} className="text-alliance-green text-sm hover:underline cursor-pointer">View All</button>
          </div>
          
          <div className="flex-1 space-y-4">
            {recentLeads.map((lead: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-alliance-hover transition-colors cursor-pointer border border-transparent hover:border-alliance-border group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-alliance-dark flex items-center justify-center text-white border border-alliance-border text-sm font-bold group-hover:border-alliance-green/30">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-alliance-green transition-colors">{lead.name}</div>
                    <div className="text-xs text-alliance-muted flex items-center gap-2 mt-0.5">
                      <span>{lead.course}</span>
                      <span className="w-1 h-1 rounded-full bg-alliance-border"></span>
                      <span className="text-alliance-green">{lead.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-alliance-muted">{lead.time}</div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div className="flex items-center justify-center h-full text-alliance-muted text-sm py-12">
                No recent lead activity logged in Sheets.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={clsx(
          "fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-xl text-white z-50 flex items-center gap-2 border transition-all duration-300 font-medium text-sm animate-bounce",
          toast.type === 'success' && "bg-[#092b1d] border-alliance-green text-[#25d366]",
          toast.type === 'info' && "bg-alliance-hover border-alliance-border text-alliance-text",
          toast.type === 'error' && "bg-red-950 border-red-500 text-red-400"
        )}>
          {toast.message}
        </div>
      )}

      {/* CRM Timeline Drawer Modal */}
      {isTimelineOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-alliance-card border border-alliance-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-alliance-border flex justify-between items-center bg-alliance-hover/50">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-alliance-green animate-pulse" /> Live Admissions Log Feed
              </h3>
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="text-alliance-muted hover:text-white transition-colors text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-[450px] overflow-y-auto space-y-4 custom-scrollbar">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setIsTimelineOpen(false);
                      router.push(`/conversations?phone=${encodeURIComponent(lead.phone)}`);
                    }}
                    className="p-3.5 rounded-lg bg-alliance-dark/50 border border-alliance-border/50 hover:border-alliance-green/30 hover:bg-alliance-hover/20 cursor-pointer transition-all flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-alliance-green/10 text-alliance-green font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="text-sm font-semibold text-white group-hover:text-alliance-green transition-colors truncate">{lead.name}</h4>
                        <span className="text-[10px] text-alliance-muted font-bold whitespace-nowrap ml-2 bg-alliance-hover px-1.5 py-0.5 rounded">{lead.time}</span>
                      </div>
                      <p className="text-xs text-alliance-muted leading-relaxed truncate">Inquired for course <span className="text-white font-medium">{lead.course}</span>. System classified lead as status: <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#053c30] text-alliance-green uppercase">{lead.status}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-alliance-muted text-sm">No live timeline event logs synced.</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-alliance-border/50 flex justify-end">
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="px-4 py-2 bg-alliance-green text-[#111b21] rounded-lg text-sm font-semibold hover:bg-[#00c298] transition-colors cursor-pointer"
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
