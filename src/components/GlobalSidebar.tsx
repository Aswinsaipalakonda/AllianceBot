"use client";
import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MessageSquare, Users, FolderOpen, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: FolderOpen },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Leads Directory', href: '/leads', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
];

function MobileBottomBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const hasActivePhone = searchParams.get('phone');
  const isConversations = pathname === '/conversations';
  const shouldHideMobileBar = isConversations && hasActivePhone;

  return (
    <div className={clsx(
      "fixed bottom-4 left-4 right-4 h-16 bg-alliance-card/90 border border-alliance-border/60 rounded-2xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 items-center justify-around px-4 transition-all duration-300 md:hidden flex",
      shouldHideMobileBar ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center flex-1 py-1">
            <div className={clsx(
              "p-2 rounded-xl transition-all duration-200 flex items-center justify-center relative",
              isActive 
                ? "text-alliance-green bg-[#00a884]/10 shadow-[0_0_10px_rgba(0,168,132,0.1)] scale-110" 
                : "text-alliance-muted hover:text-white"
            )}>
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-alliance-green rounded-full shadow-[0_0_8px_rgba(0,168,132,0.8)]" />
              )}
            </div>
          </Link>
        )
      })}
    </div>
  );
}

export function GlobalSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[72px] bg-alliance-card border-r border-alliance-border flex-col items-center py-6 gap-6 flex-shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} title={item.name} className="group relative">
              <div className={clsx(
                "p-3 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer",
                isActive 
                  ? "bg-alliance-green text-[#092b1d] shadow-[0_0_15px_rgba(0,168,132,0.4)] scale-105" 
                  : "text-alliance-muted hover:bg-alliance-hover hover:text-white"
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

      {/* Mobile Floating Bottom Bar wrapped in Suspense for static build safety */}
      <Suspense fallback={null}>
        <MobileBottomBar />
      </Suspense>
    </>
  );
}
