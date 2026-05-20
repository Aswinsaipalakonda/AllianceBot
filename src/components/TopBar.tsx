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

  const mockNotifications = [
    { id: 1, title: 'New lead incoming', desc: 'Rahul Sharma has sent an admission query.', time: '5 mins ago', type: 'inquiry' },
    { id: 2, title: 'Gemini Auto-replied', desc: 'Brochure links sent to Priya Patel.', time: '15 mins ago', type: 'bot' },
    { id: 3, title: 'Counselor follow-up needed', desc: 'Amit Kumar requested fees discount details.', time: '1 hour ago', type: 'escalation' },
  ];

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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-alliance-card border border-alliance-border rounded-xl shadow-2xl py-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-alliance-border flex justify-between items-center bg-alliance-dark/30">
                <span className="text-white font-semibold text-xs uppercase tracking-wider">Recent Activity Alerts</span>
                <span className="text-[10px] text-alliance-green font-bold bg-[#092b1d] border border-alliance-green/20 px-1.5 py-0.5 rounded">3 NEW</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-alliance-border/50">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-alliance-hover/50 transition-colors flex gap-3 cursor-pointer" onClick={() => {
                      setShowNotifications(false);
                      router.push(notif.type === 'inquiry' ? '/leads' : '/conversations');
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
                ))}
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
