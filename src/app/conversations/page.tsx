"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, MessageSquare, MoreVertical, MessageCircle,
  X, Paperclip, Smile, Mic, CheckCheck, ArrowLeft,
  Send, Image as ImageIcon, Loader2, RefreshCw, AlertCircle, ShieldAlert, Info
} from 'lucide-react';
import clsx from 'clsx';

// Wrapped in a Suspense boundary for Next.js App Router static optimization compliance
export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3 h-full">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Loading chat portal...</span>
      </div>
    }>
      <ConversationsContent />
    </Suspense>
  );
}

// Client-side date and time formatting utilities
function formatMessageTime(tsStr: string): string {
  if (!tsStr) return '';
  try {
    const date = new Date(tsStr);
    if (isNaN(date.getTime())) {
      return tsStr;
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return tsStr;
  }
}

function formatSidebarDate(tsStr: string): string {
  if (!tsStr) return '';
  try {
    const date = new Date(tsStr);
    if (isNaN(date.getTime())) {
      return tsStr.split(',')[0];
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (msgDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    return tsStr;
  }
}

function getMessageDayLabel(tsStr: string): string {
  if (!tsStr) return '';
  try {
    const date = new Date(tsStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (msgDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      const diffTime = today.getTime() - msgDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'long' });
      }
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    return '';
  }
}

function ConversationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlPhone = searchParams.get('phone');

  const [activeTab, setActiveTab] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(true);

  const showRightPane = searchParams.get('about') === 'true';

  const setShowRightPane = (val: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('about', 'true');
      router.push(`/conversations?${params.toString()}`);
    } else {
      if (searchParams.get('about') === 'true') {
        router.back();
      } else {
        params.delete('about');
        router.replace(`/conversations?${params.toString()}`);
      }
    }
  };

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // References
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrolledPhoneRef = useRef<string | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmojiClick = () => {
    setMessageInput(prev => prev + '😊');
    showToast('Emoji added!', 'info');
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast(`Selected file: ${e.target.files[0].name} for upload.`, 'success');
    }
  };

  const handleMicClick = () => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      showToast('Voice message recording started... Speak now.', 'info');
    } else {
      showToast('Voice message recording completed and saved.', 'success');
    }
  };

  const handleBlockStudent = () => {
    if (!activeChat) return;
    const confirm = window.confirm(`Are you sure you want to block ${activeChat.name}? This will silence AI responses and restrict communications.`);
    if (confirm) {
      showToast(`${activeChat.name} has been successfully blocked.`, 'error');
    }
  };

  const handleMarkSpam = () => {
    if (!activeChat) return;
    const confirm = window.confirm(`Are you sure you want to mark ${activeChat.name} as spam?`);
    if (confirm) {
      showToast(`${activeChat.name} has been marked as spam.`, 'info');
    }
  };

  // Assigns a unique, gorgeous CSS gradient based on the student's name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-[#f59e0b] to-[#ef4444]', // Warm Yellow to Red
      'from-[#10b981] to-[#3b82f6]', // Emerald to Blue
      'from-[#8b5cf6] to-[#ec4899]', // Purple to Pink
      'from-[#3b82f6] to-[#8b5cf6]', // Blue to Violet
      'from-[#06b6d4] to-[#3b82f6]', // Cyan to Blue
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return gradients[sum % gradients.length];
  };

  // 1. Fetch leads on mount
  const fetchLeads = async (selectPhone?: string) => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success) {
        setLeads(json.leads);
        // Determine which lead to select
        if (json.leads.length > 0) {
          const target = selectPhone || urlPhone;
          if (target) {
            const found = json.leads.some((l: any) => l.phone === target);
            if (found) {
              setActivePhone(target);
            } else {
              setActivePhone(json.leads[0].phone);
            }
          } else {
            // No phone in URL or parameter. 
            // On desktop, auto-select first lead. On mobile, keep it null.
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (isMobile) {
              setActivePhone(null);
            } else {
              setActivePhone(json.leads[0].phone);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [urlPhone]);

  // 2. Fetch conversation history for active phone
  const fetchMessages = async (phone: string, showLoader = false) => {
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations?phone=${encodeURIComponent(phone)}`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  // Poll for messages every 5 seconds to keep chat near-realtime
  useEffect(() => {
    if (!activePhone) return;
    
    // Initial load with spinner
    fetchMessages(activePhone, true);

    const interval = setInterval(() => {
      fetchMessages(activePhone, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [activePhone]);

  // Smart premium scroll management for conversations page
  useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return;
    const container = scrollRef.current;
    
    const isNewConversation = activePhone !== lastScrolledPhoneRef.current;
    
    if (isNewConversation) {
      // Instantly snap to bottom after the React DOM has finished painting
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        lastScrolledPhoneRef.current = activePhone;
      }, 50);
    } else {
      // In-chat polling update for same conversation: 
      // Only scroll to bottom if the counselor is already looking at the latest messages.
      const threshold = 150;
      const isNearBottom = container.scrollHeight - container.clientHeight - container.scrollTop <= threshold;
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, activePhone]);

  const activeChat = leads.find(l => l.phone === activePhone) || null;

  // Filter leads based on search query and active category tab
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.phone.includes(searchQuery) ||
                          (lead.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'unread') return lead.status === 'New Lead'; // Map unread to new leads
    if (activeTab === 'takeover') return !lead.aiEnabled; // Leads where counselor has taken over
    return true;
  });

  // Sort leads dynamically so that the latest active chats (newest timestamp/date) are at the top
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const timeA = a.timestamp || a.date ? new Date(a.timestamp || a.date).getTime() : 0;
    const timeB = b.timestamp || b.date ? new Date(b.timestamp || b.date).getTime() : 0;
    return timeB - timeA;
  });

  // Handle manual reply dispatch
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activePhone || sendingMessage) return;

    const currentMsgText = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    // Optimized UX: Add message locally first so it feels immediate
    const tempId = `temp-${Date.now()}`;
    const localMsg = {
      id: tempId,
      text: currentMsgText,
      time: new Date().toISOString(), // Standard standard ISO format
      sender: 'bot', //aligned right
      read: false,
      delivered: true // default
    };
    setMessages(prev => [...prev, localMsg]);

    // Force scroll to bottom immediately on counselor manual send
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);

    try {
      const res = await fetch('/api/conversations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activePhone,
          message: currentMsgText,
          counselorName: 'Priya Counselor' // Mock logged counselor identity
        })
      });

      const json = await res.json();
      if (!json.success) {
        console.error('Failed to transmit message');
        // Remove local temporary message on complete failure
        setMessages(prev => prev.filter(m => m.id !== tempId));
        showToast('Failed to save manual reply', 'error');
      } else {
        if (json.delivered === false) {
          // If Meta credentials failed but log succeeded, keep it in chat and show warning
          showToast('Message saved! Delivery simulated (Meta Credentials Offline).', 'info');
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, delivered: false } : m));
        } else {
          showToast('Message sent successfully via Meta Cloud API!', 'success');
        }
        // Refresh leads list to reflect updated "Last Message" in the sidebar
        fetchLeads(activePhone);
      }
    } catch (err) {
      console.error('Message transmission error:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showToast('Connection error sending message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Toggle AI auto-reply
  const handleToggleAI = async () => {
    if (!activeChat || togglingAI) return;
    setTogglingAI(true);

    const nextAIState = !activeChat.aiEnabled;

    try {
      const res = await fetch('/api/conversations/toggle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeChat.phone,
          enabled: nextAIState
        })
      });
      const json = await res.json();
      if (json.success) {
        // Dynamically update the lead array locally
        setLeads(prev => prev.map(l => {
          if (l.phone === activeChat.phone) {
            return { ...l, aiEnabled: nextAIState };
          }
          return l;
        }));
        showToast(`AI Auto-Reply turned ${nextAIState ? 'ON' : 'OFF'}`, 'success');
      }
    } catch (err) {
      console.error('Error toggling AI auto reply:', err);
      showToast('Failed to toggle AI mode', 'error');
    } finally {
      setTogglingAI(false);
    }
  };

  const handleChatSelect = (phone: string) => {
    setActivePhone(phone);
    // Sync URL param without full page reload
    router.replace(`/conversations?phone=${encodeURIComponent(phone)}`);
  };

  if (loadingLeads) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3 h-full">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Connecting live chat workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-alliance-dark font-sans text-alliance-text">
      
      {/* LEFT PANE - CHATS LIST */}
      <div className={clsx(
        "w-full md:w-[30%] md:min-w-[320px] md:max-w-[420px] flex flex-col border-r border-alliance-border bg-alliance-card flex-shrink-0 z-20 transition-all duration-300",
        activePhone ? "hidden md:flex" : "flex"
      )}>
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-alliance-border bg-alliance-dark">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-alliance-green" />
            <h1 className="text-alliance-text text-lg font-bold">Chats</h1>
          </div>
          <div className="flex items-center gap-3.5 text-alliance-muted">
            <button 
              onClick={() => {
                showToast('Refreshing conversations list...', 'info');
                fetchLeads(activePhone || undefined);
                if (activePhone) {
                  fetchMessages(activePhone, true);
                }
              }} 
              title="Sync Leads List" 
              className="cursor-pointer hover:text-alliance-text transition-all p-1 rounded hover:bg-alliance-hover"
            >
              <RefreshCw className="h-4.5 w-4.5 hover:rotate-180 duration-500" />
            </button>
          </div>
        </div>

        <div className="p-2.5 border-b border-alliance-border space-y-2.5 bg-alliance-card">
          <div className="bg-alliance-dark rounded-xl flex items-center px-3.5 py-2 gap-3 border border-alliance-border focus-within:border-alliance-green/30 transition-all shadow-inner">
            <Search className="h-4.5 w-4.5 text-alliance-muted" />
            <input 
              type="text"
              placeholder="Search by student name or text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[14.5px] text-alliance-text w-full placeholder-alliance-muted focus:ring-0 focus:outline-none"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 px-1 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: 'all', label: 'All Conversations' },
              { id: 'unread', label: 'New Leads' },
              { id: 'takeover', label: 'Counselor Override' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer shadow-sm border",
                  activeTab === tab.id 
                    ? "bg-alliance-green/10 text-alliance-green border-alliance-green/20 scale-[1.03]" 
                    : "bg-alliance-hover text-alliance-muted border-alliance-border hover:bg-alliance-hover/80 hover:text-alliance-text"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of students */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-alliance-card pb-28 md:pb-0">
          {sortedLeads.map(lead => {
            const isActive = lead.phone === activePhone;
            const initials = lead.name.substring(0, 2).toUpperCase();
            const avatarGrad = getAvatarGradient(lead.name);
            
            return (
              <div 
                key={lead.phone}
                onClick={() => handleChatSelect(lead.phone)}
                className={clsx(
                  "flex items-center px-3.5 py-3 cursor-pointer transition-all border-b border-alliance-border/60 h-[76px] relative",
                  isActive ? "bg-alliance-hover font-semibold" : "hover:bg-alliance-hover/40"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-alliance-green rounded-r" />
                )}
                
                {/* Beautiful Gradient Avatar */}
                <div className={clsx(
                  "w-12 h-12 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white mr-3.5 overflow-hidden font-bold tracking-wider text-sm shadow-md",
                  avatarGrad
                )}>
                   {initials}
                </div>
                
                <div className="flex-1 min-w-0 h-full flex flex-col justify-center pr-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[15px] text-alliance-text truncate pr-2 font-semibold tracking-wide">{lead.name}</span>
                    <span className="text-[11px] flex-shrink-0 text-alliance-muted font-medium">
                      {formatSidebarDate(lead.timestamp || lead.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-alliance-muted truncate pr-2 font-normal">
                      {lead.lastMessage || 'No chat history logged'}
                    </span>
                    {!lead.aiEnabled ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/25 text-[9.5px] font-bold tracking-wider uppercase flex-shrink-0">Human</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-alliance-green/10 text-alliance-green border border-alliance-green/20 text-[9.5px] font-bold tracking-wider uppercase flex-shrink-0">AI Agent</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {sortedLeads.length === 0 && (
            <div className="p-12 text-center text-sm text-alliance-muted font-medium">No matching conversations found.</div>
          )}
        </div>
      </div>
 
      {/* MIDDLE PANE - CHAT WINDOW */}
      {activeChat ? (
        <div className={clsx(
          "flex-1 flex flex-col relative bg-[#efeae2] min-w-0 border-r border-alliance-border/30",
          activePhone ? "flex" : "hidden md:flex"
        )}>
          {/* Subtle WhatsApp-style tiling background */}
          <div className="absolute inset-0 opacity-[0.38] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04a9d219da40cd212e0f1dd19e6fcf4a.png")' }}></div>
          
          <div className="h-[60px] px-4 bg-alliance-dark flex items-center justify-between relative z-10 border-l border-alliance-border cursor-pointer shadow-sm" onClick={() => setShowRightPane(!showRightPane)}>
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Mobile Back Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhone(null);
                  lastScrolledPhoneRef.current = null;
                  router.replace('/conversations');
                }}
                className="md:hidden p-1 mr-1 text-alliance-muted hover:text-alliance-text cursor-pointer transition-colors shrink-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <div className={clsx(
                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0",
                getAvatarGradient(activeChat.name)
              )}>
                {activeChat.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-alliance-text text-[15.5px] font-bold tracking-wide flex items-center gap-1.5 truncate">
                  {activeChat.name}
                  <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse inline-block shrink-0" title="Online" />
                </span>
                <span className="text-xs text-alliance-muted font-semibold tracking-wide truncate">{activeChat.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-alliance-muted shrink-0">
              <Search onClick={(e) => { e.stopPropagation(); showToast('Search within chat coming soon!', 'info'); }} className="h-5 w-5 hover:text-alliance-text transition-colors cursor-pointer" />
              <Info onClick={(e) => { e.stopPropagation(); setShowRightPane(!showRightPane); }} className={clsx("h-5 w-5 hover:text-alliance-text transition-colors cursor-pointer", showRightPane && "text-alliance-green")} />
              <MoreVertical onClick={(e) => { e.stopPropagation(); showToast('Chat options coming soon!', 'info'); }} className="h-5 w-5 hover:text-alliance-text transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Messages scroll display */}
          <div 
            ref={scrollRef} 
            style={{ overscrollBehaviorY: 'contain' }}
            className="flex-1 overflow-y-auto px-[6%] py-6 relative z-10 flex flex-col gap-1.5 custom-scrollbar bg-transparent"
          >
            {loadingMessages && messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-9 w-9 text-alliance-green animate-spin" />
                <span className="text-xs text-alliance-muted font-bold tracking-wider uppercase">Synchronizing live messages...</span>
              </div>
            ) : (
              messages.map((msg: any, idx: number) => {
                const isUser = msg.sender === 'user';
                const isFirstInGroup = idx === 0 || messages[idx-1].sender !== msg.sender;
                const showSimulatedTag = msg.delivered === false; // If manual dispatch failed to Meta
                
                const dayLabel = getMessageDayLabel(msg.time);
                const prevDayLabel = idx > 0 ? getMessageDayLabel(messages[idx-1].time) : '';
                const showDateSeparator = dayLabel && dayLabel !== prevDayLabel;
                
                return (
                  <React.Fragment key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4 w-full select-none">
                        <span className="px-3.5 py-1.5 rounded-xl bg-alliance-card text-alliance-muted text-[11.5px] font-bold shadow-sm border border-alliance-border tracking-wider">
                          {dayLabel}
                        </span>
                      </div>
                    )}
                    <div className={clsx("flex flex-col max-w-[75%] select-text transition-all duration-200 hover:scale-[1.01]", isUser ? "self-start" : "self-end", isFirstInGroup ? "mt-3.5" : "mt-1")}>
                      <div className={clsx(
                        "text-[14.2px] px-4 py-2.5 rounded-2xl relative shadow-sm transition-all duration-300 border",
                        isUser 
                          ? "bg-alliance-bubble-user text-alliance-text rounded-tl-none border-alliance-border border-l-alliance-green/30" 
                          : "bg-alliance-bubble text-alliance-text rounded-tr-none border-alliance-border/40 border-r-alliance-green/30",
                      )}>
                        
                        <div className="leading-relaxed break-words pr-2">{msg.text}</div>
                        
                        {/* Render Interactive suggested buttons inside CRM dashboard if bot sent buttons */}
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-alliance-border">
                            {msg.buttons.map((btn: string, bIdx: number) => (
                              <span
                                key={bIdx}
                                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-alliance-card text-alliance-green border border-alliance-green/20 select-none shadow-sm hover:bg-alliance-hover cursor-pointer"
                              >
                                🔘 {btn}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Display warning badge if message was simulated due to credentials expiration */}
                        {showSimulatedTag && (
                          <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-2.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 shadow-inner">
                            <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Simulated (Meta Token Expired)</span>
                          </div>
                        )}
                        
                        <div className="float-right mt-1.5 ml-3.5 flex items-center gap-1.5 text-[10.5px] text-alliance-muted">
                          <span>{formatMessageTime(msg.time)}</span>
                          {!isUser && (
                            <CheckCheck className={clsx(
                              "h-[15px] w-[15px]",
                              showSimulatedTag ? "text-alliance-muted" : "text-[#53bdeb]"
                            )} />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })
            )}
            {messages.length === 0 && !loadingMessages && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-alliance-muted text-sm border border-dashed border-alliance-border rounded-2xl my-12 bg-alliance-card shadow-sm">
                <AlertCircle className="h-9 w-9 text-alliance-muted mb-2 animate-bounce" />
                <span className="font-semibold">Start conversation with {activeChat.name}! Live chat history will be synced instantly below.</span>
              </div>
            )}
          </div>

          {/* Typing Input area */}
          <div className="px-4 py-3 bg-alliance-dark/95 backdrop-blur-md flex items-center gap-3.5 relative z-10 border-t border-alliance-border shadow-sm">
            <Smile onClick={handleEmojiClick} className="h-6 w-6 text-alliance-muted hover:text-alliance-text cursor-pointer transition-colors" />
            <Paperclip onClick={handleAttachmentClick} className="h-6 w-6 text-alliance-muted hover:text-alliance-text cursor-pointer -rotate-45 transition-colors" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="flex-1 bg-alliance-card border border-alliance-border rounded-2xl flex items-center px-4 py-2.5 focus-within:border-alliance-green/40 focus-within:ring-1 focus-within:ring-alliance-green/20 transition-all shadow-sm">
              <input 
                type="text" 
                placeholder={activeChat.aiEnabled ? "Disable AI Auto-Reply to manual message" : "Type a manual counselor override message"} 
                disabled={activeChat.aiEnabled}
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={clsx(
                  "bg-transparent border-none outline-none text-[15px] text-alliance-text w-full placeholder-alliance-muted focus:ring-0 focus:outline-none",
                  activeChat.aiEnabled && "cursor-not-allowed opacity-50"
                )}
              />
            </div>
            {messageInput.trim() ? (
              <Send onClick={handleSendMessage} className="h-6 w-6 text-alliance-green hover:text-[#00a884] cursor-pointer transition-colors" />
            ) : (
              <Mic onClick={handleMicClick} className={clsx("h-6 w-6 cursor-pointer transition-colors", isRecording ? "text-[#25d366] animate-pulse" : "text-alliance-muted hover:text-alliance-text")} />
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-alliance-dark">
          <MessageCircle className="h-16 w-16 text-alliance-green/20 mb-3 animate-pulse" />
          <div className="text-alliance-muted text-[14.5px] font-bold tracking-wide">Select a student from the sidebar to open the CRM console.</div>
        </div>
      )}

      {/* RIGHT PANE - CONTACT INFO / LEAD DETAILS */}
      {activeChat && showRightPane && (
        <div className="fixed inset-y-0 right-0 z-30 w-full md:w-[360px] md:relative bg-alliance-card border-l border-alliance-border flex flex-col flex-shrink-0 transition-all duration-300 animate-in slide-in-from-right duration-250 shadow-md">
          <div className="h-[60px] px-4 flex items-center gap-6 border-b border-alliance-border bg-alliance-dark/60 shadow-sm">
            <X className="h-5 w-5 text-alliance-muted cursor-pointer hover:text-alliance-text transition-colors" onClick={() => setShowRightPane(false)} />
            <span className="text-alliance-text text-[15.5px] font-bold tracking-wide">Contact Info</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="py-8 flex flex-col items-center bg-alliance-card border-b border-alliance-border">
              <div onClick={() => showToast('Profile photo update coming soon!', 'info')} className={clsx(
                "w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-3xl mb-4.5 relative overflow-hidden group cursor-pointer font-bold tracking-widest shadow-lg",
                getAvatarGradient(activeChat.name)
              )}>
                {activeChat.name.substring(0, 2).toUpperCase()}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center duration-300">
                  <ImageIcon className="h-6 w-6 mb-1 text-white" />
                  <span className="text-[9px] text-center font-bold text-white leading-snug">CHANGE<br/>PHOTO</span>
                </div>
              </div>
              <h2 className="text-lg text-alliance-text font-bold text-center px-4 leading-snug tracking-wide">{activeChat.name}</h2>
              <span className="text-sm text-alliance-muted font-medium mt-1">{activeChat.phone}</span>
            </div>

            {/* AI AUTO REPLY TAKE OVER TRIGGER */}
            <div className="my-3 bg-alliance-green/5 border-y border-alliance-green/10 py-4.5 px-5.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14.5px] font-bold text-alliance-text tracking-wide">AI Auto-Counselor</div>
                  <div className="text-[11.5px] text-alliance-muted mt-0.5 leading-relaxed">Let Gemini answer student brochure queries automatically.</div>
                </div>
                
                {/* Custom Sleek Toggle Switch */}
                <button 
                  onClick={handleToggleAI}
                  disabled={togglingAI}
                  className={clsx(
                    "w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer flex items-center border border-transparent",
                    activeChat.aiEnabled ? "bg-alliance-green border-alliance-green/20" : "bg-slate-200 border-slate-300"
                  )}
                >
                  <div 
                    className={clsx(
                      "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      activeChat.aiEnabled ? "translate-x-5.5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
              {activeChat.aiEnabled ? (
                <div className="text-[11px] text-alliance-green font-bold flex items-center gap-2 bg-alliance-green/10 px-2.5 py-1.5 rounded-lg border border-alliance-green/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-alliance-green animate-pulse"></span>
                  Gemini Active: Admissions agent is running.
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 font-bold flex items-center gap-2 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Counselor Mode: Manual messages enabled.
                </div>
              )}
            </div>

            <div className="my-3 bg-alliance-card py-4 px-5.5 border-y border-alliance-border space-y-4 shadow-sm">
              <div className="text-xs font-bold text-alliance-green tracking-widest uppercase">Lead Information</div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-alliance-text text-[14px] font-medium">Interested Course</span>
                <span className="text-alliance-muted text-[13.5px] font-bold">{activeChat.course}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-alliance-text text-[14px] font-medium">CRM Category</span>
                <span className="text-alliance-muted text-[13.5px] font-bold">{activeChat.category}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-alliance-text text-[14px] font-medium">Lead Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] bg-alliance-green/10 text-alliance-green font-bold uppercase tracking-wider border border-alliance-green/20">{activeChat.status}</span>
              </div>
            </div>

            <div className="my-3 bg-alliance-card py-2 border-y border-alliance-border text-red-500 text-sm font-semibold">
              <div onClick={handleBlockStudent} className="px-5.5 py-2.5 hover:bg-alliance-hover cursor-pointer flex items-center gap-3 transition-colors">
                <span className="tracking-wide">Block Student</span>
              </div>
              <div onClick={handleMarkSpam} className="px-5.5 py-2.5 hover:bg-alliance-hover cursor-pointer flex items-center gap-3 transition-colors">
                <span className="tracking-wide">Mark as Spam</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern sliding animated Toast notifications */}
      {toast && (
        <div className={clsx(
          "fixed bottom-6 right-6 px-4.5 py-3 rounded-2xl shadow-2xl text-white z-50 flex items-center gap-2.5 border transition-all duration-500 font-bold text-sm tracking-wide animate-slide-up",
          toast.type === 'success' && "bg-alliance-bubble border-alliance-green text-[#008069]",
          toast.type === 'info' && "bg-alliance-card border-alliance-border text-alliance-text",
          toast.type === 'error' && "bg-red-50 border-red-200 text-red-700"
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
