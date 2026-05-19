"use client";

import React from 'react';
import { 
  TrendingUp, TrendingDown, User, MessageCircle, FileText, Calendar, Clock, Download
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Leads', value: '1,248', trend: '+12%', isUp: true, icon: User, color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
    { label: 'Active Conversations', value: '214', trend: '+8%', isUp: true, icon: MessageCircle, color: 'text-[#53bdeb]', bg: 'bg-[#53bdeb]/10' },
    { label: 'Applications', value: '376', trend: '+15%', isUp: true, icon: FileText, color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
    { label: 'Admissions Confirmed', value: '112', trend: '+18%', isUp: true, icon: FileText, color: 'text-[#ffd279]', bg: 'bg-[#ffd279]/10' },
    { label: 'Pending Follow-ups', value: '97', trend: '-5%', isUp: false, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const recentLeads = [
    { name: 'Riya Sharma', course: 'BHMCT', status: 'New Lead', time: 'Today, 11:30 AM' },
    { name: 'Aditya Verma', course: 'BBA', status: 'Interested', time: 'Today, 11:28 AM' },
    { name: 'Sneha Patel', course: 'Undecided', status: 'Follow-up', time: 'Today, 11:20 AM' },
    { name: 'Mohit Kumar', course: 'BHMCT', status: 'Interested', time: 'Today, 11:18 AM' },
    { name: 'Pooja Singh', course: 'DHM', status: 'Applied', time: 'Today, 11:05 AM' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 bg-alliance-dark">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Admissions Overview</h1>
          <p className="text-alliance-muted mt-1 text-sm">Monitor your CRM performance and lead analytics.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-alliance-card border border-alliance-border rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-alliance-hover transition-colors">
            <Calendar className="h-4 w-4 text-alliance-muted" />
            <span className="text-sm text-alliance-text">May 20 - May 26, 2025</span>
          </div>
          <button className="bg-alliance-green text-[#111b21] rounded-lg px-4 py-2 flex items-center gap-2 font-medium hover:bg-[#00c298] transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex flex-col relative overflow-hidden hover:border-alliance-green/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-2.5 rounded-lg", stat.bg)}>
                <stat.icon className={clsx("h-5 w-5", stat.color)} />
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                {stat.isUp ? <TrendingUp className="h-3.5 w-3.5 text-alliance-green" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                <span className={stat.isUp ? 'text-alliance-green' : 'text-red-400'}>{stat.trend}</span>
              </div>
            </div>
            <div className="text-sm text-alliance-muted mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-6">Conversation Volume</h2>
          <div className="flex-1 border border-dashed border-alliance-border/50 rounded-lg flex items-center justify-center">
            <span className="text-alliance-muted">Chart visualization will be rendered here.</span>
          </div>
        </div>

        <div className="bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button className="text-alliance-green text-sm hover:underline">View All</button>
          </div>
          
          <div className="flex-1 space-y-4">
            {recentLeads.map((lead, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-alliance-hover transition-colors cursor-pointer border border-transparent hover:border-alliance-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-alliance-dark flex items-center justify-center text-white border border-alliance-border text-sm">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{lead.name}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

