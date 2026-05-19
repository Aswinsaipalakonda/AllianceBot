import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalSidebar } from "@/components/GlobalSidebar";
import { TopBar } from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alliance College | Admissions CRM",
  description: "Real-time WhatsApp dashboard for Alliance College Admissions Team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen flex flex-col bg-alliance-dark overflow-hidden text-alliance-text font-sans">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <GlobalSidebar />
          <main className="flex-1 overflow-auto flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
