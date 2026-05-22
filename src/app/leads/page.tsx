"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Search, Filter, Download, MoreVertical, ExternalLink, ChevronLeft, ChevronRight, User, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  'New Lead': 'text-alliance-green bg-[#053c30]/50 border-alliance-green/20',
  'Interested': 'text-[#ffd279] bg-[#493916]/50 border-[#ffd279]/20',
  'Follow-up': 'text-blue-400 bg-blue-900/20 border-blue-400/20',
  'Applied': 'text-purple-400 bg-purple-900/20 border-purple-400/20',
  'Converted': 'text-emerald-400 bg-emerald-900/20 border-emerald-400/20',
};

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Fetching real-time student leads directory...</span>
      </div>
    }>
      <LeadsContent />
    </Suspense>
  );
}

function LeadsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCourse = searchParams.get('course') || 'All';

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filterCourse, setFilterCourse] = useState(initialCourse);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add New Lead Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadCourse, setNewLeadCourse] = useState('BHMCT');
  const [newLeadStatus, setNewLeadStatus] = useState('New Lead');
  const [newLeadCategory, setNewLeadCategory] = useState('Course Queries');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown menu state per row
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearch(searchVal);
    }
    const courseVal = searchParams.get('course');
    if (courseVal !== null) {
      setFilterCourse(courseVal);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCourse]);

  const handleAddNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadName.trim(),
          phone: newLeadPhone.trim(),
          course: newLeadCourse,
          status: newLeadStatus,
          category: newLeadCategory,
          lastMessage: 'Lead created via Admissions Console'
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Student Lead added successfully!', 'success');
        setIsModalOpen(false);
        // Reset form
        setNewLeadName('');
        setNewLeadPhone('');
        setNewLeadCourse('BHMCT');
        setNewLeadStatus('New Lead');
        setNewLeadCategory('Course Queries');
        // Refresh leads list
        setLoading(true);
        const refetch = await fetch('/api/leads');
        const refetchJson = await refetch.json();
        if (refetchJson.success) {
          setLeads(refetchJson.leads);
        }
      } else {
        showToast(json.error || 'Failed to add lead.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to sheets API.', 'error');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    showToast(`Copied phone ${phone} to clipboard!`, 'success');
    setActiveMenuId(null);
  };

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const json = await res.json();
        if (json.success) {
          setLeads(json.leads);
        }
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.id.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone.includes(search);
    const matchesCourse = filterCourse === 'All' || lead.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.max(Math.ceil(filteredLeads.length / pageSize), 1);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = 'Lead ID,Name,Phone,Course,Status,Category,Last Message,Date\n';
    const csvContent = filteredLeads.map(l => 
      `"${l.id}","${l.name}","${l.phone}","${l.course}","${l.status}","${l.category}","${(l.lastMessage || '').replace(/"/g, '""')}","${l.date}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics CSV report successfully generated!', 'success');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Fetching real-time student leads directory...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-alliance-dark pb-24 md:pb-8">
      <div className="flex-shrink-0 px-4 md:px-8 py-8 border-b border-alliance-border/50 bg-gradient-to-b from-[#111b21] to-[#0b141a]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Leads <span className="text-alliance-green">Directory</span>
            </h1>
            <p className="text-alliance-muted mt-1 text-sm font-medium">Manage, filter, and track all student leads efficiently from Google Sheets in real-time.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="bg-alliance-card/85 border border-alliance-border/60 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-alliance-hover/60 hover:border-alliance-green/30 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="h-4 w-4 text-alliance-green" /> Export CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-alliance-green text-[#092b1d] rounded-xl px-4 py-2.5 text-sm font-black hover:bg-[#00c298] shadow-[0_4px_15px_rgba(0,168,132,0.25)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" strokeWidth={2.5} /> Add New Lead
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-alliance-muted" />
            <input 
              type="text" 
              placeholder="Search by name, ID or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-alliance-card/70 border border-alliance-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-alliance-muted focus:outline-none focus:border-alliance-green/50 focus:ring-1 focus:ring-alliance-green/50 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-alliance-green" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-alliance-card/70 border border-alliance-border/60 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-alliance-green/50 cursor-pointer"
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

      <div className="flex-1 p-4 md:p-8">
        
        {/* Desktop Table View */}
        <div className="hidden md:block bg-gradient-to-br from-[#111b21] to-[#070c0e] border border-alliance-border/70 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-alliance-dark/30 border-b border-alliance-border/70">
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Lead ID & Name</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Lead Category</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider">Last Sync</th>
                <th className="px-6 py-4 text-xs font-bold text-alliance-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-alliance-border/40">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#122027]/40 transition-colors group">
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-alliance-dark border border-alliance-border/60 flex items-center justify-center text-xs font-black text-white group-hover:border-alliance-green/30">
                        {lead.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-alliance-green transition-colors duration-200">{lead.name}</div>
                        <div className="text-xs text-alliance-muted font-medium">{lead.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-alliance-text font-semibold">{lead.phone}</td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-[#a5b4fc] font-bold">{lead.course}</td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-alliance-muted font-semibold">{lead.category}</td>
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className={clsx("px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase", STATUS_COLORS[lead.status] || 'text-white bg-gray-700')}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-alliance-muted font-bold">{lead.date}</td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
                      <Link href={`/conversations?phone=${encodeURIComponent(lead.phone)}`} className="text-alliance-green hover:text-[#00c298] transition-colors" title="View Conversation">
                        <ExternalLink className="h-4.5 w-4.5" />
                      </Link>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                          className="text-alliance-muted hover:text-white transition-colors cursor-pointer" 
                          title="More Options"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>
                        {activeMenuId === lead.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-alliance-card border border-alliance-border/70 rounded-xl shadow-2xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                            <Link href={`/conversations?phone=${encodeURIComponent(lead.phone)}`} className="block px-4 py-2 text-sm text-alliance-text font-bold hover:bg-alliance-hover">
                              Quick Chat Override
                            </Link>
                            <button 
                              onClick={() => handleCopyPhone(lead.phone)}
                              className="w-full text-left block px-4 py-2 text-sm text-alliance-text font-bold hover:bg-alliance-hover cursor-pointer"
                            >
                              Copy Student Phone
                            </button>
                            <button 
                              onClick={() => {
                                showToast(`Initiated Counselor Review for ${lead.name}`, 'info');
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left block px-4 py-2 text-sm text-alliance-text font-bold hover:bg-alliance-hover cursor-pointer"
                            >
                              Trigger Counselor Review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-alliance-muted font-semibold">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Card View - Eliminates horizontal table row breaks */}
        <div className="block md:hidden space-y-4">
          {paginatedLeads.map((lead) => (
            <div 
              key={lead.id} 
              className="bg-gradient-to-br from-[#111b21] to-[#070c0e] border border-alliance-border/70 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-alliance-dark border border-alliance-border flex items-center justify-center text-xs font-bold text-white uppercase shadow-md">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{lead.name}</h3>
                    <p className="text-[10px] text-alliance-muted font-semibold">{lead.id}</p>
                  </div>
                </div>
                <span className={clsx("px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase border", STATUS_COLORS[lead.status] || 'text-white bg-gray-700')}>
                  {lead.status}
                </span>
              </div>
              <div className="space-y-2.5 text-xs border-t border-alliance-border/50 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-alliance-muted font-medium">WhatsApp Contact:</span>
                  <span className="text-white font-bold">{lead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alliance-muted font-medium">Course:</span>
                  <span className="text-[#a5b4fc] font-bold">{lead.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alliance-muted font-medium">Primary Inquiry:</span>
                  <span className="text-white font-bold">{lead.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alliance-muted font-medium">Last Sync:</span>
                  <span className="text-alliance-muted font-bold">{lead.date}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-alliance-border/50">
                <Link href={`/conversations?phone=${encodeURIComponent(lead.phone)}`} className="flex items-center gap-1.5 text-xs text-alliance-green font-bold hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> View Chat
                </Link>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopyPhone(lead.phone)}
                    className="px-3 py-1.5 bg-alliance-dark border border-alliance-border rounded-xl text-[10px] text-white font-bold cursor-pointer"
                  >
                    Copy Phone
                  </button>
                  <button 
                    onClick={() => {
                      showToast(`Initiated Counselor Review for ${lead.name}`, 'info');
                    }}
                    className="px-3 py-1.5 bg-alliance-dark border border-alliance-border rounded-xl text-[10px] text-white font-bold cursor-pointer"
                  >
                    Trigger Review
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedLeads.length === 0 && (
            <div className="py-16 text-center text-alliance-muted font-semibold bg-[#111b21]/50 border border-dashed border-alliance-border rounded-2xl">
              No leads found matching your criteria.
            </div>
          )}
        </div>
 
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-bold text-alliance-muted bg-[#111b21]/20 p-4 border border-alliance-border/40 rounded-2xl">
          <div>Showing <span className="font-extrabold text-white">{paginatedLeads.length}</span> of <span className="font-extrabold text-white">{filteredLeads.length}</span> results (Page {currentPage} of {totalPages})</div>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-alliance-border bg-alliance-card hover:bg-alliance-hover hover:border-alliance-green/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="h-4.5 w-4.5 text-white" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-alliance-border bg-alliance-card hover:bg-alliance-hover hover:border-alliance-green/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight className="h-4.5 w-4.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast alert notifications */}
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

      {/* Add New Lead Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#111b21] to-[#0b141a] border border-alliance-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-alliance-border flex justify-between items-center bg-[#122027]/40 shadow-sm">
              <h3 className="text-white font-bold text-lg">Add Prospective Student Lead</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-alliance-muted hover:text-white transition-colors text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddNewLead} className="p-6 space-y-4.5">
              <div>
                <label className="block text-xs font-black text-alliance-muted uppercase tracking-widest mb-2">Student Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  className="w-full bg-alliance-dark/70 border border-alliance-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-alliance-muted uppercase tracking-widest mb-2">WhatsApp Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +919876543210"
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                  className="w-full bg-alliance-dark/70 border border-alliance-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-alliance-muted uppercase tracking-widest mb-2">Interested Course</label>
                  <select 
                    value={newLeadCourse}
                    onChange={e => setNewLeadCourse(e.target.value)}
                    className="w-full bg-alliance-dark border border-alliance-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-alliance-green cursor-pointer"
                  >
                    <option value="BHMCT">BHMCT</option>
                    <option value="BBA">BBA</option>
                    <option value="DHM">DHM</option>
                    <option value="Undecided">Undecided</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-alliance-muted uppercase tracking-widest mb-2">Lead Status</label>
                  <select 
                    value={newLeadStatus}
                    onChange={e => setNewLeadStatus(e.target.value)}
                    className="w-full bg-alliance-dark border border-alliance-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-alliance-green cursor-pointer"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Applied">Applied</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-alliance-muted uppercase tracking-widest mb-2">Primary Inquiry Category</label>
                <select 
                  value={newLeadCategory}
                  onChange={e => setNewLeadCategory(e.target.value)}
                  className="w-full bg-alliance-dark border border-alliance-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-alliance-green cursor-pointer"
                >
                  <option value="Course Queries">Course Queries</option>
                  <option value="Placement Queries">Placement Queries</option>
                  <option value="Scholarship Queries">Scholarship Queries</option>
                  <option value="Human Followups">Human Followups</option>
                </select>
              </div>

              <div className="pt-4.5 flex justify-end gap-3 border-t border-alliance-border/50">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 border border-alliance-border rounded-xl text-sm font-bold text-alliance-muted hover:bg-alliance-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-alliance-green text-[#092b1d] rounded-xl text-sm font-bold hover:bg-[#00c298] disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Lead Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
