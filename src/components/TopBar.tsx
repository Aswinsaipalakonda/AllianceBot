"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, LogOut, Shield, Award, User, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export function TopBar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to format timestamp into modern relative text
  const formatNotifTime = (tsStr: string): string => {
    if (!tsStr) return 'Just now';
    try {
      const date = new Date(tsStr);
      if (isNaN(date.getTime())) return tsStr;
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return tsStr;
    }
  };

  // Fetch dynamic, live notifications from Google Sheets API
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/leads');
        const json = await res.json();
        if (json.success && json.leads) {
          // Sort leads by their timestamp descending
          const sorted = [...json.leads].sort((a: any, b: any) => {
            const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tB - tA;
          });

          // Map the 5 latest activity items
          const mapped = sorted.slice(0, 5).map((lead: any, index: number) => {
            let title = 'Active Conversation';
            let desc = `Chat with ${lead.name} is open.`;
            let type = 'inquiry';
            
            if (lead.status === 'New Lead') {
              title = 'New Lead Incoming';
              desc = `${lead.name} has initiated an admission query.`;
              type = 'inquiry';
            } else if (lead.status === 'Follow-up' || lead.category === 'Human Followups') {
              title = 'Counselor follow-up needed';
              desc = `${lead.name} requires human assistance for ${lead.course}.`;
              type = 'escalation';
            } else if (lead.aiEnabled) {
              title = 'Gemini Auto-replied';
              desc = `AI agent responded to ${lead.name} regarding ${lead.course}.`;
              type = 'bot';
            }
            
            return {
              id: lead.phone || String(index),
              title,
              desc,
              time: lead.timestamp ? formatNotifTime(lead.timestamp) : 'Just now',
              type,
              phone: lead.phone
            };
          });
          
          setNotifications(mapped);

          // Badge count counts follow-ups and new leads
          const activeCount = sorted.filter((l: any) => l.status === 'New Lead' || l.status === 'Follow-up' || l.category === 'Human Followups').length;
          setBadgeCount(activeCount);
        }
      } catch (err) {
        console.error('Failed to sync dynamic notifications:', err);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-16 border-b border-alliance-border bg-alliance-card px-4 flex items-center justify-between shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-alliance-border relative">
          <Image src="/logo.jpg" alt="Alliance College Logo" fill className="object-cover" />
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-wide text-sm">Alliance College</h1>
          <p className="text-xs text-alliance-muted">Admissions Team</p>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-alliance-muted group-focus-within:text-alliance-green transition-colors" />
          </div>
          <input 
            type="text" 
            ref={searchInputRef}
            placeholder="Search globally..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-12 py-2 bg-alliance-dark border border-alliance-border rounded-lg text-sm text-alliance-text placeholder-alliance-muted focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd className="hidden sm:inline-block border border-alliance-border bg-alliance-dark rounded px-1.5 text-[10px] font-mono text-alliance-muted">⌘ K</kbd>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-5 relative">
        <div className="flex items-center gap-2 bg-[#092b1d] border border-alliance-green/30 text-alliance-green px-3 py-1.5 rounded-full text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-alliance-green animate-pulse"></div>
          Online
        </div>
        
        {/* Notifications: wrapper must not be a button so dropdown actions can use real buttons */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-alliance-muted hover:text-white transition-colors cursor-pointer"
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell className="h-5 w-5" />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {badgeCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-alliance-card border border-alliance-border rounded-xl shadow-2xl py-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-alliance-border flex justify-between items-center bg-alliance-dark/30">
                <span className="text-white font-semibold text-xs uppercase tracking-wider">Recent Activity Alerts</span>
                {badgeCount > 0 && (
                  <span className="text-[10px] text-alliance-green font-bold bg-[#092b1d] border border-alliance-green/20 px-1.5 py-0.5 rounded">
                    {badgeCount} ACTIVE
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-alliance-border/50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 hover:bg-alliance-hover/50 transition-colors flex gap-3 cursor-pointer" onClick={() => {
                        setShowNotifications(false);
                        router.push(`/conversations?phone=${encodeURIComponent(notif.phone)}`);
                      }}>
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                        notif.type === 'inquiry' && "bg-alliance-green/10 text-alliance-green",
                        notif.type === 'bot' && "bg-[#53bdeb]/10 text-[#53bdeb]",
                        notif.type === 'escalation' && "bg-amber-500/10 text-amber-400"
                      )}>
                        {notif.type === 'inquiry' && <User className="h-4 w-4" />}
                        {notif.type === 'bot' && <MessageCircle className="h-4 w-4" />}
                        {notif.type === 'escalation' && <Shield className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate leading-snug">{notif.title}</div>
                        <div className="text-xs text-alliance-muted mt-0.5 leading-relaxed">{notif.desc}</div>
                        <div className="text-[10px] text-alliance-muted mt-1 font-medium">{notif.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-alliance-muted font-medium">
                    No active admissions alerts logged.
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-alliance-border/50 text-center bg-alliance-dark/20 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    router.push('/leads');
                  }}
                  className="text-xs text-alliance-green hover:underline font-medium cursor-pointer"
                >
                  View All Leads Feed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div 
          ref={profileRef}
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2 cursor-pointer hover:bg-alliance-dark/50 p-1.5 rounded-lg transition-colors relative"
        >
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold border border-alliance-border">
            AK
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white leading-tight">Admin</div>
            <div className="text-[10px] text-alliance-muted">Super Admin</div>
          </div>
          <ChevronDown className="h-4 w-4 text-alliance-muted" />

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-alliance-card border border-alliance-border rounded-xl shadow-2xl py-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-alliance-border flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold border border-alliance-border">
                  AK
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white leading-none font-medium">Admin User</span>
                  <span className="text-[10px] text-alliance-muted truncate mt-1">admin@alliance.edu</span>
                </div>
              </div>
              
              <div className="py-1">
                <div className="px-4 py-2 flex items-center gap-2 text-xs text-alliance-muted">
                  <Shield className="h-3.5 w-3.5 text-alliance-green" />
                  <span>Role: Full CRM Access</span>
                </div>
                <div className="px-4 py-2 flex items-center gap-2 text-xs text-alliance-muted">
                  <Award className="h-3.5 w-3.5 text-alliance-green" />
                  <span>Verified Admissions Officer</span>
                </div>
              </div>

              <div className="border-t border-alliance-border/50 pt-1.5 mt-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfile(false);
                    showToast('Logged out of Admissions session successfully.');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-alliance-hover flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-xl text-white z-50 flex items-center gap-2 border bg-alliance-bubble border-alliance-green text-[#25d366] font-medium text-sm animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
