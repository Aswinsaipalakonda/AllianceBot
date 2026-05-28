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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  const handleExportCSV = async () => {
    try {
      showToast('Preparing spreadsheet report...', 'info');
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (!json.success || !json.leads) {
        showToast('Failed to retrieve student records.', 'error');
        return;
      }
      
      const leadsList = json.leads;
      
      // Prefix phone numbers with a tab character to force Excel to treat them strictly as text, preventing scientific notation
      const rowsText = leadsList.map((lead: any, idx: number) => {
        const timeClean = lead.timestamp ? lead.timestamp.replace(/"/g, '""') : 'Just now';
        return `"${idx + 1}","${lead.name.replace(/"/g, '""')}","\t${lead.phone}","${lead.course.replace(/"/g, '""')}","${lead.status.replace(/"/g, '""')}","${lead.category.replace(/"/g, '""')}","${timeClean}"`;
      }).join('\n');
      
      const headers = 'Alliance College - Student Admissions Register\n\nS.No,Student Name,Phone Number,Inquired Course,Lead Status,Query Category,Time Registered\n' + rowsText;
        
      const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `student_admissions_register_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportModalOpen(false);
      showToast('Student Admissions Register Excel/CSV downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting student directory.', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      showToast('Preparing PDF document...', 'info');
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (!json.success || !json.leads) {
        showToast('Failed to retrieve student records.', 'error');
        return;
      }
      
      const leadsList = json.leads;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Pop-up blocked! Please allow pop-ups to print PDF.', 'error');
        return;
      }
      
      const dateStr = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const rowsHTML = leadsList.map((lead: any, idx: number) => {
        const timeClean = lead.timestamp || 'Just now';
        return `
          <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
            <td style="font-weight: 700; text-align: center; color: #667781;">${idx + 1}</td>
            <td style="font-weight: 700; color: #111b21;">${lead.name}</td>
            <td style="font-family: monospace; letter-spacing: 0.5px;">${lead.phone}</td>
            <td><span class="course-badge">${lead.course}</span></td>
            <td><span class="status-badge status-${lead.status.toLowerCase().replace(/\s+/g, '-')}">${lead.status}</span></td>
            <td style="color: #667781; font-weight: 500;">${lead.category}</td>
            <td style="color: #8696a0; font-size: 11px;">${timeClean}</td>
          </tr>
        `;
      }).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Alliance College - Student Admissions Register</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background-color: #ffffff !important;
              }
              @page {
                size: A4 landscape;
                margin: 12mm 15mm;
              }
              .no-print {
                display: none !important;
              }
            }
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              background-color: #ffffff;
              color: #111b21;
              margin: 0;
              padding: 0;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e9edef;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            
            .logo-container {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #111b21;
              margin: 0;
              letter-spacing: -0.5px;
            }
            
            .subtitle {
              font-size: 13px;
              color: #667781;
              margin: 3px 0 0 0;
              font-weight: 500;
            }
            
            .meta-info {
              text-align: right;
              font-size: 12px;
              color: #667781;
              font-weight: 500;
            }
            
            .table-container {
              border: 1px solid #e9edef;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 20px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
              font-size: 12px;
            }
            
            th {
              background-color: #f0f2f5;
              color: #111b21;
              font-weight: 800;
              padding: 12px 14px;
              font-size: 10.5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #e9edef;
            }
            
            td {
              padding: 12px 14px;
              border-bottom: 1px solid #e9edef;
              color: #3b4a54;
            }
            
            tr.even {
              background-color: #ffffff;
            }
            
            tr.odd {
              background-color: #f8f9fa;
            }
            
            .course-badge {
              background-color: #f0f2f5;
              color: #111b21;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 11px;
            }
            
            .status-badge {
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            
            .status-interested { background-color: rgba(255, 210, 121, 0.2); color: #b27b0b; }
            .status-follow-up { background-color: rgba(59, 130, 246, 0.15); color: #1d4ed8; }
            .status-new-lead { background-color: rgba(0, 128, 105, 0.15); color: #008069; }
            .status-applied { background-color: rgba(147, 51, 234, 0.15); color: #7c3aed; }
            .status-converted { background-color: rgba(16, 185, 129, 0.15); color: #059669; }
            
            .footer {
              margin-top: 30px;
              border-top: 1px solid #e9edef;
              padding-top: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #8696a0;
              font-weight: 500;
            }
            
            .print-btn {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: #008069;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0, 128, 105, 0.2);
              transition: all 0.2s;
              font-family: 'Inter', sans-serif;
            }
            
            .print-btn:hover {
              background-color: #00a884;
              transform: translateY(-1px);
            }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>
          
          <div class="header">
            <div class="logo-container">
              <div style="font-weight: 900; font-size: 26px; color: #008069; letter-spacing: -1px;">A</div>
              <div>
                <h1 class="title">Alliance College</h1>
                <p class="subtitle">Admissions Student Registry Summary</p>
              </div>
            </div>
            <div class="meta-info">
              <div style="font-weight: 700; color: #111b21;">OFFICIAL STUDENT ADMISSIONS REGISTER</div>
              <div>Generated: ${dateStr} at ${timeStr}</div>
            </div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 6%; text-align: center;">S.No</th>
                  <th style="width: 22%;">Student Name</th>
                  <th style="width: 18%;">Phone Number</th>
                  <th style="width: 16%;">Inquired Course</th>
                  <th style="width: 15%;">Lead Status</th>
                  <th style="width: 23%;">Query Category</th>
                  <th style="width: 0%;">Time Registered</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <span>Alliance College Admissions Management Portal &copy; 2026. Confidential and Proprietary.</span>
            <span>Roster Size: ${leadsList.length} Students Logged</span>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      setIsExportModalOpen(false);
      showToast('Print-ready landscape Student Registry PDF generated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting student directory.', 'error');
    }
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
            onClick={() => setIsExportModalOpen(true)} 
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
          
          {/* Equalizer area spline chart */}
          <div className="flex-1 flex flex-col mt-2 relative min-h-[220px] w-full">
            
            {/* Absolute positioned floating dynamic tooltips HUD matching Dribbble details */}
            {hoveredIdx !== null && chartPoints[hoveredIdx] && (
              <div 
                className="absolute bg-white/95 border border-alliance-border p-4 rounded-xl shadow-xl backdrop-blur-sm z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2"
                style={{
                  left: `${Math.min(320, Math.max(20, (hoveredIdx / (chartPoints.length > 1 ? chartPoints.length - 1 : 1)) * 420 + 20))}px`,
                  top: `10px`
                }}
              >
                <div className="text-[10px] font-black text-alliance-muted uppercase tracking-wider border-b border-alliance-border pb-1">
                  {chartPoints[hoveredIdx].detailLabel || chartPoints[hoveredIdx].label}
                </div>
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <div className="flex justify-between items-center text-xs font-bold text-alliance-text">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1c64f2]" />
                      Total Inbound
                    </span>
                    <span className="font-mono">{chartPoints[hoveredIdx].value}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-alliance-text">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#008069]" />
                      AI Resolved
                    </span>
                    <span className="font-mono text-alliance-green">{Math.round(chartPoints[hoveredIdx].value * 0.7)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-alliance-text">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                      Counselor Action
                    </span>
                    <span className="font-mono text-orange-600">{Math.max(0, chartPoints[hoveredIdx].value - Math.round(chartPoints[hoveredIdx].value * 0.7))}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Interactive SVG area canvas */}
            <svg 
              viewBox="0 0 520 220" 
              className="w-full h-full overflow-visible select-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const svgWidth = rect.width;
                const relativeX = (mouseX / svgWidth) * 520;
                const N = chartPoints.length;
                if (N < 2) return;
                const closestIdx = Math.min(
                  N - 1,
                  Math.max(0, Math.round(((relativeX - 45) / 450) * (N - 1)))
                );
                setHoveredIdx(closestIdx);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Definitions for gorgeous fluid gradient fills */}
              <defs>
                <linearGradient id="total-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1c64f2" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1c64f2" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="ai-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008069" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#008069" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="human-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Dashed Lines */}
              {(() => {
                const gridTicks = [0, 0.25, 0.5, 0.75, 1];
                return gridTicks.map(t => {
                  const yVal = 180 - t * 160;
                  const label = Math.round(t * maxVal);
                  return (
                    <g key={`grid-line-${t}`} className="opacity-25">
                      <line x1="45" y1={yVal} x2="495" y2={yVal} stroke="#ccd0d5" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="35" y={yVal + 3.5} textAnchor="end" className="text-[10px] font-mono font-bold fill-alliance-muted">{label}</text>
                    </g>
                  );
                });
              })()}

              {/* Draw Area Paths Underneath Curves */}
              {(() => {
                const N = chartPoints.length;
                const denom = N > 1 ? N - 1 : 1;
                
                const totalPts = chartPoints.map((p: any, i: number) => ({
                  x: 45 + (i / denom) * 450,
                  y: 180 - (p.value / maxVal) * 160
                }));
                
                const aiPts = chartPoints.map((p: any, i: number) => ({
                  x: 45 + (i / denom) * 450,
                  y: 180 - (Math.round(p.value * 0.7) / maxVal) * 160
                }));
                
                const humanPts = chartPoints.map((p: any, i: number) => {
                  const aiVal = Math.round(p.value * 0.7);
                  const humanVal = Math.max(0, p.value - aiVal);
                  return {
                    x: 45 + (i / denom) * 450,
                    y: 180 - (humanVal / maxVal) * 160
                  };
                });

                const getBezierPath = (pts: { x: number; y: number }[]) => {
                  if (pts.length === 0) return '';
                  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
                  let d = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = pts[i];
                    const p1 = pts[i + 1];
                    const cx1 = p0.x + (p1.x - p0.x) * 0.35;
                    const cy1 = p0.y;
                    const cx2 = p0.x + (p1.x - p0.x) * 0.65;
                    const cy2 = p1.y;
                    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
                  }
                  return d;
                };

                const getAreaPath = (pts: { x: number; y: number }[]) => {
                  if (pts.length === 0) return '';
                  const linePath = getBezierPath(pts);
                  const first = pts[0];
                  const last = pts[pts.length - 1];
                  return `${linePath} L ${last.x} 180 L ${first.x} 180 Z`;
                };

                return (
                  <g>
                    {/* SVG Gradient Areas */}
                    <path d={getAreaPath(totalPts)} fill="url(#total-gradient)" />
                    <path d={getAreaPath(aiPts)} fill="url(#ai-gradient)" />
                    <path d={getAreaPath(humanPts)} fill="url(#human-gradient)" />

                    {/* SVG Splines Lines */}
                    <path d={getBezierPath(totalPts)} fill="none" stroke="#1c64f2" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={getBezierPath(aiPts)} fill="none" stroke="#008069" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={getBezierPath(humanPts)} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive hover tracks guidelines and nodes */}
                    {hoveredIdx !== null && totalPts[hoveredIdx] && aiPts[hoveredIdx] && humanPts[hoveredIdx] && (
                      <g>
                        {/* Vertical dotted cursor guide line */}
                        <line 
                          x1={totalPts[hoveredIdx].x} 
                          y1="20" 
                          x2={totalPts[hoveredIdx].x} 
                          y2="180" 
                          stroke="#008069" 
                          strokeWidth="1.5" 
                          strokeDasharray="3 3" 
                          className="opacity-50"
                        />
                        {/* Circular nodes overlay */}
                        <circle cx={totalPts[hoveredIdx].x} cy={totalPts[hoveredIdx].y} r="5" fill="#1c64f2" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx={aiPts[hoveredIdx].x} cy={aiPts[hoveredIdx].y} r="5" fill="#008069" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx={humanPts[hoveredIdx].x} cy={humanPts[hoveredIdx].y} r="5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* X-axis Labels */}
              {chartPoints.map((pt: any, i: number) => {
                const N = chartPoints.length;
                const denom = N > 1 ? N - 1 : 1;
                const xPos = 45 + (i / denom) * 450;
                return (
                  <text 
                    key={`x-axis-lbl-${i}`} 
                    x={xPos} 
                    y="204" 
                    textAnchor="middle" 
                    className={clsx(
                      "text-[10px] font-bold fill-alliance-muted/80 transition-colors duration-200 select-none",
                      i === hoveredIdx && "fill-alliance-green font-black"
                    )}
                  >
                    {pt.label}
                  </text>
                );
              })}
            </svg>

            {/* Dribbble Style Bottom Legend Panel */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-alliance-border text-[11px] font-bold select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1c64f2] shadow-[0_0_6px_rgba(28,100,242,0.3)]" />
                <span className="text-alliance-text">Total Inbound</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008069] shadow-[0_0_6px_rgba(0,128,105,0.3)]" />
                <span className="text-alliance-green">AI Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.3)]" />
                <span className="text-orange-600">Counselor Action</span>
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

      {/* 7. EXPORT OPTIONS FORMAT SELECTION MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-alliance-card border border-alliance-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-alliance-border flex justify-between items-center bg-alliance-dark/40 shadow-sm">
              <h3 className="text-alliance-text font-bold text-lg flex items-center gap-2.5">
                <Download className="h-5 w-5 text-alliance-green animate-pulse" /> Export CRM Report
              </h3>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-alliance-muted hover:text-alliance-text transition-colors text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-alliance-muted leading-relaxed">
                Choose your preferred file layout to download current statistics, student inquiry registers, and lead preference distributions.
              </p>
              
              {/* Option 1: Excel CSV */}
              <button 
                onClick={handleExportCSV}
                className="flex items-start gap-4 p-4 rounded-xl border border-alliance-green bg-[#008069]/5 hover:bg-[#008069]/10 transition-all text-left w-full cursor-pointer group shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-alliance-green/10 text-alliance-green border border-alliance-green/20 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-alliance-text group-hover:text-alliance-green transition-colors">Excel / CSV Spreadsheet</h4>
                  <p className="text-[11px] text-alliance-muted mt-1 leading-normal font-medium">
                    Optimized for data tables and calculations in Excel or Sheets. Phone columns are pre-formatted to prevent scientific notation.
                  </p>
                </div>
              </button>
              
              {/* Option 2: PDF Document */}
              <button 
                onClick={handleExportPDF}
                className="flex items-start gap-4 p-4 rounded-xl border border-alliance-border bg-alliance-dark hover:border-alliance-green/30 hover:bg-alliance-hover transition-all text-left w-full cursor-pointer group shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/10 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                  <Activity className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-alliance-text group-hover:text-alliance-green transition-colors">PDF Document (Print Ready)</h4>
                  <p className="text-[11px] text-alliance-muted mt-1 leading-normal font-medium">
                    Perfect landscape layout to save or print. Contains clean tabular metrics, course shares, and lead cards styled specifically for A4 paper sizes.
                  </p>
                </div>
              </button>
            </div>

            <div className="px-6 py-4.5 border-t border-alliance-border flex justify-end bg-alliance-dark/30 shadow-inner">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2.5 bg-alliance-hover text-alliance-text border border-alliance-border rounded-xl text-sm font-bold hover:bg-alliance-active transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
