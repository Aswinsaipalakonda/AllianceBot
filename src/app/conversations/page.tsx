"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, MessageSquare, MoreVertical, MessageCircle,
  X, Paperclip, Smile, Mic, CheckCheck,
  Send, Image as ImageIcon, Loader2, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';

// Wrapped in a Suspense boundary for Next.js App Router static optimization compliance
export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Loading chat portal...</span>
      </div>
    }>
      <ConversationsContent />
    </Suspense>
  );
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
  const [showRightPane, setShowRightPane] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // References
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 1. Fetch leads on mount
  const fetchLeads = async (selectPhone?: string) => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success) {
        setLeads(json.leads);
        // Determine which lead to select
        if (json.leads.length > 0) {
          const target = selectPhone || urlPhone || json.leads[0].phone;
          const found = json.leads.some((l: any) => l.phone === target);
          if (found) {
            setActivePhone(target);
          } else {
            setActivePhone(json.leads[0].phone);
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

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

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

  // Handle manual reply dispatch
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activePhone || sendingMessage) return;

    const currentMsgText = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    // Optimized UX: Add message locally first so it feels immediate
    const tempId = `temp-${Date.now()}`;
    const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMsg = {
      id: tempId,
      text: currentMsgText,
      time: localTime,
      sender: 'bot', //aligned right
      read: false
    };
    setMessages(prev => [...prev, localMsg]);

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
        // Remove local temporary message on fail
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        // Refresh leads list to reflect updated "Last Message" in the sidebar
        fetchLeads(activePhone);
      }
    } catch (err) {
      console.error('Message transmission error:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
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
      }
    } catch (err) {
      console.error('Error toggling AI auto reply:', err);
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
      <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark gap-3">
        <Loader2 className="h-10 w-10 text-alliance-green animate-spin" />
        <span className="text-alliance-muted text-sm font-medium">Connecting live chat workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-alliance-card font-sans">
      
      {/* LEFT PANE - CHATS LIST */}
      <div className="w-[30%] min-w-[320px] max-w-[420px] flex flex-col border-r border-alliance-border bg-alliance-card flex-shrink-0 z-20">
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-alliance-border">
          <h1 className="text-white text-xl font-semibold">Chats</h1>
          <div className="flex items-center gap-3 text-alliance-muted">
            <RefreshCw onClick={() => fetchLeads(activePhone || undefined)} className="h-4.5 w-4.5 hover:text-white cursor-pointer transition-all hover:rotate-180 duration-500" title="Sync Leads List" />
            <MessageSquare onClick={() => { if (activePhone) { showToast('Opening WhatsApp...', 'info'); window.open('https://wa.me/' + activePhone, '_blank'); } }} className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
            <MoreVertical onClick={() => showToast('Chat settings coming soon!', 'info')} className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="p-2 border-b border-alliance-border">
          <div className="bg-alliance-hover rounded-lg flex items-center px-3 py-1.5 gap-3">
            <Search className="h-4 w-4 text-alliance-muted" />
            <input 
              type="text"
              placeholder="Search by student name or text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-alliance-text w-full placeholder-alliance-muted focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 mt-3 px-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All Conversations' },
              { id: 'unread', label: 'New Leads' },
              { id: 'takeover', label: 'Counselor Override' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-[#0a332c] text-[#25d366]" 
                    : "bg-alliance-hover text-alliance-muted hover:bg-alliance-border hover:text-alliance-text"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredLeads.map(lead => {
            const isActive = lead.phone === activePhone;
            return (
              <div 
                key={lead.phone}
                onClick={() => handleChatSelect(lead.phone)}
                className={clsx(
                  "flex items-center px-3 py-2 cursor-pointer transition-colors group h-[72px]",
                  isActive ? "bg-alliance-active" : "hover:bg-alliance-hover"
                )}
              >
                <div className="w-[48px] h-[48px] rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-white mr-3 overflow-hidden font-bold">
                   {lead.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 border-b border-alliance-border/50 group-hover:border-transparent group-[.bg-alliance-active]:border-transparent h-full flex flex-col justify-center pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[15px] text-white truncate pr-2 font-medium">{lead.name}</span>
                    <span className="text-xs flex-shrink-0 text-alliance-muted">{lead.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-alliance-muted truncate pr-2">
                      {lead.lastMessage || 'No chat history logged'}
                    </span>
                    {!lead.aiEnabled && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold tracking-wider uppercase flex-shrink-0">Human</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filteredLeads.length === 0 && (
            <div className="p-8 text-center text-sm text-alliance-muted">No matching conversations found.</div>
          )}
        </div>
      </div>

      {/* MIDDLE PANE - CHAT WINDOW */}
      {activeChat ? (
        <div className="flex-1 flex flex-col relative bg-alliance-dark min-w-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")' }}></div>
          
          <div className="h-[60px] px-4 bg-alliance-card flex items-center justify-between border-l border-alliance-border/30 relative z-10 cursor-pointer" onClick={() => setShowRightPane(!showRightPane)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {activeChat.name.substring(0,2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[15px] font-medium">{activeChat.name}</span>
                <span className="text-[13px] text-alliance-muted">{activeChat.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-alliance-muted">
              <Search onClick={(e) => { e.stopPropagation(); showToast('Search within chat coming soon!', 'info'); }} className="h-5 w-5 hover:text-white transition-colors cursor-pointer" />
              <MoreVertical onClick={(e) => { e.stopPropagation(); showToast('Chat options coming soon!', 'info'); }} className="h-5 w-5 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Messages display */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-[5%] py-4 relative z-10 flex flex-col gap-1 custom-scrollbar">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 text-alliance-green animate-spin" />
                <span className="text-xs text-alliance-muted">Synchronizing live messages...</span>
              </div>
            ) : (
              messages.map((msg: any, idx: number) => {
                const isUser = msg.sender === 'user';
                const isFirstInGroup = idx === 0 || messages[idx-1].sender !== msg.sender;
                return (
                  <div key={msg.id} className={clsx("flex flex-col max-w-[65%]", isUser ? "self-start" : "self-end", isFirstInGroup ? "mt-2" : "mt-0.5")}>
                    <div className={clsx(
                      "text-[14.2px] px-2.5 py-1.5 rounded-lg shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] whitespace-pre-wrap relative",
                      isUser 
                        ? "bg-alliance-bubble-user text-alliance-text rounded-tr-lg" 
                        : "bg-alliance-bubble text-alliance-text rounded-tl-lg",
                      isFirstInGroup && isUser ? "rounded-tl-none" : "rounded-tl-lg",
                      isFirstInGroup && !isUser ? "rounded-tr-none" : "rounded-tr-lg",
                    )}>
                      {/* Fake tail for first message in group */}
                      {isFirstInGroup && (
                        <div className={clsx(
                          "absolute top-0 w-2 h-3",
                          isUser ? "-left-2 bg-alliance-bubble-user" : "-right-2 bg-alliance-bubble"
                        )} style={{ clipPath: isUser ? 'polygon(100% 0, 100% 100%, 0 0)' : 'polygon(0 0, 100% 0, 0 100%)'}}></div>
                      )}
                      
                      <div className="mb-3 leading-relaxed">{msg.text}</div>
                      <div className="float-right -mb-1 ml-2 flex items-center gap-1 text-[11px] text-white/50 translate-y-1">
                        <span>{msg.time}</span>
                        {!isUser && <CheckCheck className="h-[15px] w-[15px] text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            {messages.length === 0 && !loadingMessages && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-alliance-muted text-sm border border-dashed border-alliance-border/50 rounded-xl my-12 bg-alliance-dark/20">
                <span>Start conversation with {activeChat.name}! Live chat history will be synced instantly below.</span>
              </div>
            )}
          </div>

          {/* Typing area */}
          <div className="px-4 py-3 bg-alliance-card flex items-center gap-4 relative z-10 border-t border-alliance-border/50">
            <Smile onClick={handleEmojiClick} className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer" />
            <Paperclip onClick={handleAttachmentClick} className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer -rotate-45" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="flex-1 bg-alliance-hover rounded-lg flex items-center px-3 py-2.5">
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
              <Send onClick={handleSendMessage} className="h-6 w-6 text-alliance-green hover:text-[#00c298] cursor-pointer" />
            ) : (
              <Mic onClick={handleMicClick} className={clsx("h-6 w-6 cursor-pointer", isRecording ? "text-alliance-green animate-pulse" : "text-alliance-muted hover:text-white")} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-alliance-dark">
          <MessageCircle className="h-16 w-16 text-alliance-muted/50 mb-3 animate-pulse" />
          <div className="text-alliance-muted text-sm">Select a student from the sidebar to open the CRM console.</div>
        </div>
      )}

      {/* RIGHT PANE - CONTACT INFO / LEAD DETAILS */}
      {activeChat && showRightPane && (
        <div className="w-[400px] bg-alliance-card border-l border-alliance-border flex flex-col flex-shrink-0 z-20 transition-all duration-300">
          <div className="h-[60px] px-4 flex items-center gap-6 border-b border-alliance-border">
            <X className="h-5 w-5 text-alliance-muted cursor-pointer hover:text-white" onClick={() => setShowRightPane(false)} />
            <span className="text-white text-[15px] font-medium">Contact info</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="py-7 flex flex-col items-center bg-alliance-card shadow-sm border-b border-alliance-border">
              <div onClick={() => showToast('Profile photo update coming soon!', 'info')} className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center text-white text-4xl mb-4 relative overflow-hidden group cursor-pointer font-bold">
                {activeChat.name.substring(0,2).toUpperCase()}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-[10px] text-center font-normal">CHANGE<br/>PHOTO</span>
                </div>
              </div>
              <h2 className="text-lg text-white font-normal text-center px-4 leading-snug">{activeChat.name}</h2>
              <span className="text-sm text-alliance-muted mt-1">{activeChat.phone}</span>
            </div>

            {/* AI AUTO REPLY TAKE OVER TRIGGER */}
            <div className="my-2 bg-[#092b1d]/40 border-y border-alliance-green/10 py-4 px-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">AI Auto-Counselor</div>
                  <div className="text-xs text-alliance-muted mt-0.5">Let Gemini answer student brochure queries automatically.</div>
                </div>
                
                {/* Custom Toggle Switch */}
                <button 
                  onClick={handleToggleAI}
                  disabled={togglingAI}
                  className={clsx(
                    "w-12 h-6.5 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer flex items-center",
                    activeChat.aiEnabled ? "bg-alliance-green" : "bg-[#222e35]"
                  )}
                >
                  <div 
                    className={clsx(
                      "w-4.5 h-4.5 rounded-full bg-[#111b21] shadow-md transform transition-transform duration-300",
                      activeChat.aiEnabled ? "translate-x-5.5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
              {activeChat.aiEnabled ? (
                <div className="text-[11px] text-[#25d366] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse"></span>
                  Gemini Active: Handling admissions queries automatically.
                </div>
              ) : (
                <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Counselor Override: AI disabled. Free to send manual replies.
                </div>
              )}
            </div>

            <div className="my-2 bg-alliance-card py-4 px-6 border-y border-alliance-border space-y-4">
              <div className="text-[13px] text-alliance-green font-medium mb-2">Lead Information</div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">Interested Course</span>
                <span className="text-alliance-muted text-sm">{activeChat.course}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">CRM Category</span>
                <span className="text-alliance-muted text-sm">{activeChat.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">Lead Status</span>
                <span className="px-2 py-0.5 rounded text-xs bg-[#053c30] text-alliance-green font-bold uppercase tracking-wider">{activeChat.status}</span>
              </div>
            </div>

            <div className="my-2 bg-alliance-card py-3 border-y border-alliance-border text-red-500">
              <div onClick={handleBlockStudent} className="px-6 py-2 hover:bg-alliance-hover cursor-pointer flex items-center gap-6">
                <span className="text-[15px] font-medium">Block Student</span>
              </div>
              <div onClick={handleMarkSpam} className="px-6 py-2 hover:bg-alliance-hover cursor-pointer flex items-center gap-6">
                <span className="text-[15px] font-medium">Mark as Spam</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={clsx(
          "fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-xl text-white z-50 flex items-center gap-2 border transition-all duration-300 font-medium text-sm animate-bounce",
          toast.type === 'success' && "bg-[#092b1d] border-alliance-green text-[#25d366]",
          toast.type === 'info' && "bg-alliance-hover border-alliance-border text-alliance-text",
          toast.type === 'error' && "bg-red-950 border-red-500 text-red-400"
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
