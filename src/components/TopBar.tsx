"use client";
import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export function TopBar() {
  return (
    <div className="h-16 border-b border-alliance-border bg-alliance-card px-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-alliance-border relative">
          <Image src="/logo.jpg" alt="Alliance College Logo" fill className="object-cover" />
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-wide text-sm">Alliance College</h1>
          <p className="text-xs text-alliance-muted">Admissions Team</p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-alliance-muted group-focus-within:text-alliance-green transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search globally..." 
            className="block w-full pl-10 pr-12 py-2 bg-alliance-dark border border-alliance-border rounded-lg text-sm text-alliance-text placeholder-alliance-muted focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd className="hidden sm:inline-block border border-alliance-border bg-alliance-dark rounded px-1.5 text-[10px] font-mono text-alliance-muted">⌘ K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-[#092b1d] border border-alliance-green/30 text-alliance-green px-3 py-1.5 rounded-full text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-alliance-green animate-pulse"></div>
          Online
        </div>
        
        <button className="relative text-alliance-muted hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">12</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-alliance-dark/50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium">
            AK
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white leading-tight">Admin</div>
            <div className="text-[10px] text-alliance-muted">Super Admin</div>
          </div>
          <ChevronDown className="h-4 w-4 text-alliance-muted" />
        </div>
      </div>
    </div>
  );
}
