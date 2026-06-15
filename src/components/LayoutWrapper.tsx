"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { GlobalSidebar } from './GlobalSidebar';
import { TopBar } from './TopBar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="h-screen w-screen bg-alliance-dark overflow-hidden text-alliance-text font-sans">
        {children}
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-alliance-dark overflow-hidden text-alliance-text font-sans">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <GlobalSidebar />
        <main className="flex-1 overflow-auto flex flex-col pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
