"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, MessageSquare, MoreVertical, 
  X, Paperclip, Smile, Mic, Check, CheckCheck,
  User, MessageCircle, FileText, Calendar, Send, Download, Image as ImageIcon
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- MOCK DATA ---
const INITIAL_CHATS = [
  { 
    id: 1, 
    name: 'Riya Sharma', 
    phone: '+91 98765 43210',
    course: 'BHMCT',
    qualification: '12th Passed',
    city: 'Lucknow, Uttar Pradesh',
    assignedTo: 'Priya Counselor',
    created: '26 May 2025, 11:29 AM',
    status: 'New Lead',
    tags: [
      { label: 'BHMCT', color: 'text-[#53bdeb] bg-[#10364c]' }, 
      { label: 'New Lead', color: 'text-alliance-green bg-[#053c30]' }
    ], 
    unread: 2, 
    online: true, 
    messages: [
      { id: 1, text: 'Hi', time: '11:29 AM', sender: 'user' },
      { id: 2, text: 'Hello Riya! 👋\nWelcome to Alliance College. How can I help you today?', time: '11:29 AM', sender: 'bot', read: true },
      { id: 3, text: 'I want to know about BHMCT course', time: '11:30 AM', sender: 'user' },
      { id: 4, text: 'BHMCT (Bachelor of Hospitality Management & Catering Technology)\nDuration: 4 Years\nEligibility: 10+2 in any stream\n\nOur BHMCT program includes industrial training, expert faculty, modern labs and 100% placement assistance.', time: '11:30 AM', sender: 'bot', read: true },
      { id: 5, text: 'What are the placement opportunities?', time: '11:30 AM', sender: 'user' },
      { id: 6, text: 'Our students are placed in top companies like Taj, Hyatt, Marriott, Radisson, ITC Hotels, Emirates, JLL, and many more.', time: '11:30 AM', sender: 'bot', read: true },
      { id: 7, text: 'Thank you!', time: '11:31 AM', sender: 'user' }
    ]
  },
  { 
    id: 2, 
    name: 'Aditya Verma', 
    phone: '+91 91234 56789',
    course: 'BBA',
    qualification: '12th Appearing',
    city: 'Delhi',
    assignedTo: 'Rahul Admin',
    created: '26 May 2025, 10:15 AM',
    status: 'Interested',
    tags: [
      { label: 'BBA', color: 'text-[#d099ff] bg-[#361f4b]' }, 
      { label: 'Interested', color: 'text-[#ffd279] bg-[#493916]' }
    ], 
    unread: 0, 
    online: false, 
    messages: [
      { id: 1, text: 'What is the eligibility for BBA?', time: '11:28 AM', sender: 'user' },
      { id: 2, text: 'To be eligible for BBA, you need 10+2 in any stream with a minimum of 50% marks.', time: '11:30 AM', sender: 'bot', read: true }
    ]
  }
];

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(INITIAL_CHATS[0].id);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPane, setShowRightPane] = useState(true);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.messages[chat.messages.length - 1]?.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'unread') return chat.unread > 0;
    if (activeTab === 'new') return chat.tags.some(t => t.label === 'New Lead');
    return true;
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    const newMessage = {
      id: Date.now(),
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'bot',
      read: false
    };
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, newMessage], unread: 0 };
      }
      return chat;
    }));
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleChatSelect = (id: number) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  return (
    <div className="flex h-full overflow-hidden bg-alliance-card font-sans">
      
      {/* LEFT PANE - CHATS LIST */}
      <div className="w-[30%] min-w-[320px] max-w-[420px] flex flex-col border-r border-alliance-border bg-alliance-card flex-shrink-0 z-20">
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-alliance-border">
          <h1 className="text-white text-xl font-semibold">Chats</h1>
          <div className="flex items-center gap-3 text-alliance-muted">
            <MessageSquare className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
            <MoreVertical className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="p-2 border-b border-alliance-border">
          <div className="bg-alliance-hover rounded-lg flex items-center px-3 py-1.5 gap-3">
            <Search className="h-4 w-4 text-alliance-muted" />
            <input 
              type="text"
              placeholder="Search or start a new chat"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-alliance-text w-full placeholder-alliance-muted"
            />
          </div>
          <div className="flex gap-2 mt-3 px-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread 157' },
              { id: 'new', label: 'New Leads 55' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors",
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
          {filteredChats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isActive = chat.id === activeChatId;
            return (
              <div 
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={clsx(
                  "flex items-center px-3 py-2 cursor-pointer transition-colors group h-[72px]",
                  isActive ? "bg-alliance-active" : "hover:bg-alliance-hover"
                )}
              >
                <div className="w-[48px] h-[48px] rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-white mr-3 overflow-hidden relative">
                   {chat.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 border-b border-alliance-border/50 group-hover:border-transparent group-[.bg-alliance-active]:border-transparent h-full flex flex-col justify-center pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[15px] text-white truncate pr-2">{chat.name}</span>
                    <span className={clsx("text-xs flex-shrink-0", chat.unread ? "text-[#25d366]" : "text-alliance-muted")}>{lastMsg?.time || chat.created}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-alliance-muted truncate pr-2">
                      {lastMsg?.sender === 'bot' && <CheckCheck className="inline h-3.5 w-3.5 mr-1" />}
                      {lastMsg?.text}
                    </span>
                    {chat.unread > 0 && (
                      <div className="w-[18px] h-[18px] rounded-full bg-[#25d366] flex items-center justify-center text-[#111b21] text-[10px] font-bold">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MIDDLE PANE - CHAT WINDOW */}
      {activeChat ? (
        <div className="flex-1 flex flex-col relative bg-alliance-dark min-w-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")' }}></div>
          
          <div className="h-[60px] px-4 bg-alliance-card flex items-center justify-between border-l border-alliance-border/30 relative z-10 cursor-pointer" onClick={() => setShowRightPane(!showRightPane)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                {activeChat.name.substring(0,2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[15px] font-medium">{activeChat.name}</span>
                <span className="text-[13px] text-alliance-muted">{activeChat.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-alliance-muted">
              <Search className="h-5 w-5 hover:text-white transition-colors" />
              <MoreVertical className="h-5 w-5 hover:text-white transition-colors" />
            </div>
          </div>

          <ChatMessages messages={activeChat.messages} />

          <div className="px-4 py-3 bg-alliance-card flex items-center gap-4 relative z-10">
            <Smile className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer" />
            <Paperclip className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer -rotate-45" />
            <div className="flex-1 bg-alliance-hover rounded-lg flex items-center px-3 py-2.5">
              <input 
                type="text" 
                placeholder="Type a message" 
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-[15px] text-alliance-text w-full placeholder-alliance-muted"
              />
            </div>
            {messageInput.trim() ? (
              <Send onClick={handleSendMessage} className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer" />
            ) : (
              <Mic className="h-6 w-6 text-alliance-muted hover:text-white cursor-pointer" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-alliance-dark">
          <div className="text-alliance-muted text-sm">Select a chat to view conversations</div>
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
              <div className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center text-white text-5xl mb-4 relative overflow-hidden group cursor-pointer">
                {activeChat.name.substring(0,2).toUpperCase()}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">CHANGE<br/>PROFILE PHOTO</span>
                </div>
              </div>
              <h2 className="text-xl text-white font-normal text-center px-4">{activeChat.name}</h2>
              <span className="text-[15px] text-alliance-muted mt-1">{activeChat.phone}</span>
            </div>

            <div className="my-2 bg-alliance-card py-4 px-6 border-y border-alliance-border space-y-4">
              <div className="text-[13px] text-alliance-green font-medium mb-2">Lead Information</div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">Interested Course</span>
                <span className="text-alliance-muted text-sm">{activeChat.course}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">Status</span>
                <span className="px-2 py-0.5 rounded text-xs bg-[#053c30] text-alliance-green">{activeChat.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px]">Assigned To</span>
                <span className="text-alliance-muted text-sm">{activeChat.assignedTo}</span>
              </div>
            </div>

            <div className="my-2 bg-alliance-card py-4 px-6 border-y border-alliance-border">
              <div className="flex items-center justify-between cursor-pointer">
                <span className="text-white text-[15px]">Media, links and docs</span>
                <span className="text-alliance-muted text-sm flex items-center gap-2">0 <ChevronRight /></span>
              </div>
            </div>

            <div className="my-2 bg-alliance-card py-3 border-y border-alliance-border text-red-500">
              <div className="px-6 py-2 hover:bg-alliance-hover cursor-pointer flex items-center gap-6">
                <span className="text-[15px]">Block Riya Sharma</span>
              </div>
              <div className="px-6 py-2 hover:bg-alliance-hover cursor-pointer flex items-center gap-6">
                <span className="text-[15px]">Report contact</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessages({ messages }: { messages: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-[5%] py-4 relative z-10 flex flex-col gap-1 custom-scrollbar">
      {messages.map((msg: any, idx: number) => {
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
              
              <div className="mb-3">{msg.text}</div>
              <div className="float-right -mb-1 ml-2 flex items-center gap-1 text-[11px] text-white/60 translate-y-1">
                <span>{msg.time}</span>
                {!isUser && msg.read && <CheckCheck className="h-[15px] w-[15px] text-[#53bdeb]" />}
                {!isUser && !msg.read && <Check className="h-[15px] w-[15px] text-white/60" />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" height="20" width="20" preserveAspectRatio="xMidYMid meet" className="fill-current" fill="currentColor">
      <path d="M7 21L14.9 13.1C15.5 12.5 15.5 11.5 14.9 10.9L7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );
}
