"use client";

import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, ExternalLink, ChevronLeft, ChevronRight, User } from 'lucide-react';
import clsx from 'clsx';

const MOCK_LEADS = [
  { id: 'LD-1021', name: 'Riya Sharma', phone: '+91 98765 43210', course: 'BHMCT', status: 'New Lead', source: 'WhatsApp', date: '26 May 2025' },
  { id: 'LD-1022', name: 'Aditya Verma', phone: '+91 91234 56789', course: 'BBA', status: 'Interested', source: 'Website', date: '26 May 2025' },
  { id: 'LD-1023', name: 'Sneha Patel', phone: '+91 99887 77665', course: 'Undecided', status: 'Follow-up', source: 'WhatsApp', date: '25 May 2025' },
  { id: 'LD-1024', name: 'Mohit Kumar', phone: '+91 98761 11223', course: 'BHMCT', status: 'Interested', source: 'Instagram', date: '25 May 2025' },
  { id: 'LD-1025', name: 'Pooja Singh', phone: '+91 91233 44556', course: 'DHM', status: 'Applied', source: 'WhatsApp', date: '24 May 2025' },
  { id: 'LD-1026', name: 'Rahul Joshi', phone: '+91 99881 22334', course: 'BBA', status: 'Converted', source: 'Walk-in', date: '23 May 2025' },
  { id: 'LD-1027', name: 'Anjali Desai', phone: '+91 98711 55667', course: 'BHMCT', status: 'Follow-up', source: 'WhatsApp', date: '23 May 2025' },
  { id: 'LD-1028', name: 'Karan Mehra', phone: '+91 91222 33445', course: 'Undecided', status: 'New Lead', source: 'Website', date: '22 May 2025' },
];

const STATUS_COLORS: Record<string, string> = {
  'New Lead': 'text-alliance-green bg-[#053c30]',
  'Interested': 'text-[#ffd279] bg-[#493916]',
  'Follow-up': 'text-blue-400 bg-blue-900/30',
  'Applied': 'text-purple-400 bg-purple-900/30',
  'Converted': 'text-emerald-400 bg-emerald-900/30'
};

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  const filteredLeads = MOCK_LEADS.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || lead.id.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = filterCourse === 'All' || lead.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-alliance-dark">
      <div className="flex-shrink-0 px-8 py-8 border-b border-alliance-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Leads Directory</h1>
            <p className="text-alliance-muted mt-1 text-sm">Manage, filter, and track all student leads efficiently.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-alliance-card border border-alliance-border text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-alliance-hover transition-colors flex items-center gap-2">
              <Download className="h-4 w-4 text-alliance-muted" /> Export CSV
            </button>
            <button className="bg-alliance-green text-[#111b21] rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#00c298] transition-colors flex items-center gap-2">
              <User className="h-4 w-4" /> Add New Lead
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-alliance-muted" />
            <input 
              type="text" 
              placeholder="Search by name or Lead ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-alliance-card border border-alliance-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-alliance-muted focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-alliance-muted" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-alliance-card border border-alliance-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-alliance-green cursor-pointer"
            >
              <option value="All">All Courses</option>
              <option value="BHMCT">BHMCT</option>
              <option value="BBA">BBA</option>
              <option value="DHM">DHM</option>
              <option value="Undecided">Undecided</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-alliance-card border border-alliance-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-alliance-dark/50 border-b border-alliance-border">
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Lead ID & Name</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-alliance-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-alliance-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-alliance-hover/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-alliance-dark border border-alliance-border flex items-center justify-center text-xs font-bold text-white">
                        {lead.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-alliance-muted">{lead.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-alliance-text">{lead.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-alliance-text font-medium">{lead.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-alliance-muted">{lead.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx("px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase", STATUS_COLORS[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-alliance-muted">{lead.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-alliance-green hover:text-[#00c298] transition-colors" title="View Conversation">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button className="text-alliance-muted hover:text-white transition-colors" title="More Options">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-alliance-muted">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-alliance-muted">
          <div>Showing <span className="font-medium text-white">{filteredLeads.length}</span> of <span className="font-medium text-white">{MOCK_LEADS.length}</span> results</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-alliance-border bg-alliance-card hover:bg-alliance-hover disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-alliance-border bg-alliance-card hover:bg-alliance-hover disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
