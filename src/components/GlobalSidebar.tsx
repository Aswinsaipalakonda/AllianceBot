"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Users, FolderOpen, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

export function GlobalSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: FolderOpen },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare },
    { name: 'Leads Directory', href: '/leads', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ];


  return (
    <div className="w-16 md:w-[72px] bg-alliance-card border-r border-alliance-border flex flex-col items-center py-6 gap-6 flex-shrink-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} title={item.name} className="group relative">
            <div className={clsx(
              "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
              isActive 
                ? "bg-alliance-green text-[#092b1d] shadow-[0_0_15px_rgba(14,166,100,0.3)]" 
                : "text-alliance-muted hover:bg-alliance-dark hover:text-white"
            )}>
              <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {/* Tooltip */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-alliance-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-alliance-border z-50">
              {item.name}
            </div>
          </Link>
        )
      })}
    </div>
  );
}
