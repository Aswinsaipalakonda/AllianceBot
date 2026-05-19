"use client";

import React from 'react';
import { 
  TrendingUp, TrendingDown, User, MessageCircle, FileText, Calendar, Clock, Download
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Leads', value: '1,248', trend: '+12%', isUp: true, icon: User, color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
    { label: 'Active Conversations', value: '214', trend: '+8%', isUp: true, icon: MessageCircle, color: 'text-[#53bdeb]', bg: 'bg-[#53bdeb]/10' },
    { label: 'Applications', value: '376', trend: '+15%', isUp: true, icon: FileText, color: 'text-alliance-green', bg: 'bg-[#00a884]/10' },
    { label: 'Admissions Confirmed', value: '112', trend: '+18%', isUp: true, icon: FileText, color: 'text-[#ffd279]', bg: 'bg-[#ffd279]/10' },
    { label: 'Pending Follow-ups', value: '97', trend: '-5%', isUp: false, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const recentLeads = [
    { name: 'Riya Sharma', course: 'BHMCT', status: 'New Lead', time: 'Today, 11:30 AM' },
    { name: 'Aditya Verma', course: 'BBA', status: 'Interested', time: 'Today, 11:28 AM' },
    { name: 'Sneha Patel', course: 'Undecided', status: 'Follow-up', time: 'Today, 11:20 AM' },
    { name: 'Mohit Kumar', course: 'BHMCT', status: 'Interested', time: 'Today, 11:18 AM' },
    { name: 'Pooja Singh', course: 'DHM', status: 'Applied', time: 'Today, 11:05 AM' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 bg-alliance-dark">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Admissions Overview</h1>
          <p className="text-alliance-muted mt-1 text-sm">Monitor your CRM performance and lead analytics.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-alliance-card border border-alliance-border rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-alliance-hover transition-colors">
            <Calendar className="h-4 w-4 text-alliance-muted" />
            <span className="text-sm text-alliance-text">May 20 - May 26, 2025</span>
          </div>
          <button className="bg-alliance-green text-[#111b21] rounded-lg px-4 py-2 flex items-center gap-2 font-medium hover:bg-[#00c298] transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-alliance-card border border-alliance-border rounded-xl p-5 flex flex-col relative overflow-hidden hover:border-alliance-green/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-2.5 rounded-lg", stat.bg)}>
                <stat.icon className={clsx("h-5 w-5", stat.color)} />
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                {stat.isUp ? <TrendingUp className="h-3.5 w-3.5 text-alliance-green" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                <span className={stat.isUp ? 'text-alliance-green' : 'text-red-400'}>{stat.trend}</span>
              </div>
            </div>
            <div className="text-sm text-alliance-muted mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-6">Conversation Volume</h2>
          <div className="flex-1 border border-dashed border-alliance-border/50 rounded-lg flex items-center justify-center">
            <span className="text-alliance-muted">Chart visualization will be rendered here.</span>
          </div>
        </div>

        <div className="bg-alliance-card border border-alliance-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button className="text-alliance-green text-sm hover:underline">View All</button>
          </div>
          
          <div className="flex-1 space-y-4">
            {recentLeads.map((lead, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-alliance-hover transition-colors cursor-pointer border border-transparent hover:border-alliance-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-alliance-dark flex items-center justify-center text-white border border-alliance-border text-sm">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-alliance-muted flex items-center gap-2 mt-0.5">
                      <span>{lead.course}</span>
                      <span className="w-1 h-1 rounded-full bg-alliance-border"></span>
                      <span className="text-alliance-green">{lead.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-alliance-muted">{lead.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  const stats = [
    { label: 'Total Leads', value: '1,248', trend: '+12%', isUp: true, icon: User, color: 'text-alliance-green', bg: 'bg-[#092b1d]' },
    { label: 'Active Conversations', value: '214', trend: '+8%', isUp: true, icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Applications', value: '376', trend: '+15%', isUp: true, icon: FileText, color: 'text-alliance-green', bg: 'bg-[#092b1d]' },
    { label: 'Admissions Confirmed', value: '112', trend: '+18%', isUp: true, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Pending Follow-ups', value: '97', trend: '-5%', isUp: false, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="flex gap-4 items-center w-full overflow-x-auto pb-2 scrollbar-hide">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex-1 min-w-[200px] bg-alliance-card border border-alliance-border rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-alliance-green/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className={clsx("p-2 rounded-lg", stat.bg)}>
              <stat.icon className={clsx("h-4 w-4", stat.color)} />
            </div>
            <div className="text-xs font-medium text-alliance-muted flex items-center gap-1">
              {stat.isUp ? <TrendingUp className="h-3 w-3 text-alliance-green" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
              <span className={stat.isUp ? 'text-alliance-green' : 'text-red-400'}>{stat.trend}</span>
              <span className="text-[10px] text-alliance-muted ml-0.5">this week</span>
            </div>
          </div>
          <div className="text-sm text-alliance-muted mb-1">{stat.label}</div>
          <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
        </div>
      ))}
      
      <div className="min-w-[180px] bg-alliance-card border border-alliance-border rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-alliance-dark transition-colors self-stretch ml-auto">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-alliance-muted" />
          <span className="text-xs text-alliance-text">May 20 - May 26, 2025</span>
        </div>
        <ChevronDown className="h-4 w-4 text-alliance-muted" />
      </div>
    </div>
  );
}

function ConversationsSidebar({ chats, activeTab, setActiveTab, activeChatId, onSelectChat, searchQuery, setSearchQuery }: any) {
  const tabs = [
    { id: 'all', label: 'All', count: 214 },
    { id: 'unread', label: 'Unread', count: 32 },
    { id: 'new', label: 'New Leads', count: 18 },
    { id: 'follow', label: 'Follow-up' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-alliance-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Conversations</h2>
          <div className="flex gap-3 text-alliance-muted">
            <Filter className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
            <MessageSquare className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
            <Edit3 className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-alliance-muted" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-alliance-dark border border-alliance-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-alliance-text placeholder-alliance-muted focus:outline-none focus:border-alliance-green transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap flex items-center gap-1.5 border transition-all",
                  isActive 
                    ? "bg-[#092b1d] border-alliance-green text-alliance-green" 
                    : "bg-alliance-dark border-alliance-border text-alliance-muted hover:border-gray-600 hover:text-gray-300"
                )}
              >
                {tab.label}
                {tab.count && (
                  <span className={clsx(
                    "px-1.5 rounded-full text-[9px]",
                    isActive ? "bg-alliance-green text-[#092b1d]" : "bg-alliance-border text-alliance-muted"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat: any) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const isActive = chat.id === activeChatId;
          
          return (
            <div 
              key={chat.id} 
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                "flex gap-3 p-3 border-b border-alliance-border cursor-pointer transition-colors relative group",
                isActive ? "bg-alliance-dark/80 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-alliance-green" : "hover:bg-alliance-dark/50"
              )}
            >
              <div className="relative flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-alliance-border">
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    {chat.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-alliance-green rounded-full border-2 border-alliance-card"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-sm font-medium text-white truncate pr-2">{chat.name}</h3>
                  <span className={clsx("text-[10px] flex-shrink-0", chat.unread > 0 ? "text-alliance-green font-medium" : "text-alliance-muted")}>
                    {lastMessage?.time || chat.time}
                  </span>
                </div>
                
                <p className={clsx("text-xs truncate mb-1.5", chat.unread > 0 ? "text-white font-medium" : "text-alliance-muted")}>
                  {lastMessage?.text || 'No messages yet'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 overflow-hidden">
                    {chat.tags.map((tag: any, idx: number) => (
                      <span key={idx} className={clsx("text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap", tag.color)}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-4 h-4 rounded-full bg-alliance-green flex items-center justify-center text-[#092b1d] text-[9px] font-bold ml-2 flex-shrink-0">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {chats.length === 0 && (
          <div className="p-4 text-center text-sm text-alliance-muted">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ chat, messageInput, setMessageInput, onSendMessage, onKeyDown }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  return (
    <div className="flex flex-col h-full relative z-10">
      <div className="h-16 px-4 border-b border-alliance-border bg-alliance-card/80 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                {chat.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            {chat.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-alliance-green rounded-full border-2 border-alliance-card"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-sm">{chat.name}</h2>
              <span className={clsx("text-[10px] px-1.5 py-0.5 rounded border", chat.tags[1]?.color || chat.tags[0]?.color)}>
                {chat.tags[1]?.label || chat.tags[0]?.label}
              </span>
            </div>
            <p className="text-xs text-alliance-muted">{chat.phone}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-alliance-muted">
          <Search className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
          <MoreVertical className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth">
        <div className="flex justify-center my-2">
          <span className="text-[10px] bg-alliance-dark border border-alliance-border text-alliance-muted px-3 py-1 rounded-full shadow-sm">Today</span>
        </div>

        {chat.messages.map((msg: any) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={clsx("flex flex-col gap-1 max-w-[85%]", isUser ? "items-start" : "items-end ml-auto")}>
              <div className={clsx(
                "text-sm px-3 py-2 rounded-lg shadow-sm whitespace-pre-wrap", 
                isUser 
                  ? "bg-alliance-bubble-user text-white rounded-tl-sm border border-alliance-border" 
                  : "bg-alliance-bubble text-white rounded-tr-sm border border-alliance-green/20"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mx-1">
                <span className="text-[9px] text-alliance-muted">{msg.time}</span>
                {!isUser && msg.read && <CheckCheck className="h-3 w-3 text-alliance-green" />}
                {!isUser && !msg.read && <Check className="h-3 w-3 text-alliance-muted" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-alliance-card/80 backdrop-blur-md border-t border-alliance-border flex-shrink-0 z-20">
        <div className="flex items-center gap-2 bg-alliance-dark border border-alliance-border rounded-xl px-3 py-2">
          <button className="text-alliance-muted hover:text-white transition-colors p-1">
            <Smile className="h-5 w-5" />
          </button>
          <button className="text-alliance-muted hover:text-white transition-colors p-1">
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            placeholder="Type a message" 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-alliance-muted focus:outline-none px-2"
          />
          {messageInput.trim() ? (
            <button onClick={onSendMessage} className="text-alliance-green hover:text-white transition-colors p-1">
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button className="text-alliance-muted hover:text-alliance-green transition-colors p-1">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadDetailsSidebar({ chat }: any) {
  const steps = ['New Lead', 'Interested', 'Follow-up', 'Applied', 'Converted'];
  const currentStepIndex = steps.indexOf(chat.status);

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 px-4 border-b border-alliance-border flex items-center justify-between flex-shrink-0">
        <h2 className="text-white font-semibold text-sm">Lead Details</h2>
        <div className="flex items-center gap-3 text-alliance-muted">
          <Star className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
          <Edit3 className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
          <X className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 flex flex-col items-center border-b border-alliance-border relative">
          <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mb-3 border-2 border-alliance-card shadow-lg relative">
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              {chat.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
          {chat.online && (
            <div className="absolute top-[88px] right-[145px] w-4 h-4 bg-alliance-green rounded-full border-2 border-alliance-card flex items-center justify-center"></div>
          )}
          
          <h2 className="text-white font-semibold text-lg mb-1">{chat.name}</h2>
          <div className="flex items-center gap-1.5 text-alliance-muted text-xs mb-3">
            <span>{chat.phone}</span>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
              <MessageCircle className="h-2 w-2 text-green-500 fill-current" />
            </div>
          </div>

          <button className="flex items-center justify-between gap-2 bg-alliance-green/10 border border-alliance-green/30 text-alliance-green px-3 py-1.5 rounded-lg text-xs font-medium w-full max-w-[200px] hover:bg-alliance-green/20 transition-colors">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-alliance-green rounded-full"></div>
              {chat.status}
            </div>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex border-b border-alliance-border px-4">
          {['Overview', 'Activity', 'Notes', 'Files'].map((tab, idx) => (
            <button 
              key={tab} 
              className={clsx(
                "flex-1 py-3 text-xs font-medium transition-colors relative",
                idx === 0 ? "text-alliance-green" : "text-alliance-muted hover:text-white"
              )}
            >
              {tab}
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-alliance-green rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-y-3 text-xs">
            <div className="flex items-center gap-2 text-alliance-muted">
              <FileText className="h-3.5 w-3.5" />
              <span>Interested Course</span>
            </div>
            <div className="text-white font-medium pl-2">{chat.course}</div>

            <div className="flex items-center gap-2 text-alliance-muted">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Lead Source</span>
            </div>
            <div className="text-white pl-2">WhatsApp</div>

            <div className="flex items-center gap-2 text-alliance-muted">
              <div className="h-3.5 w-3.5 border border-alliance-muted rounded-full flex items-center justify-center text-[8px]">📍</div>
              <span>City</span>
            </div>
            <div className="text-white pl-2">{chat.city}</div>

            <div className="flex items-center gap-2 text-alliance-muted">
              <User className="h-3.5 w-3.5" />
              <span>Qualification</span>
            </div>
            <div className="text-white pl-2">{chat.qualification}</div>

            <div className="flex items-center gap-2 text-alliance-muted">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created At</span>
            </div>
            <div className="text-white pl-2">{chat.created}</div>

            <div className="flex items-center gap-2 text-alliance-muted">
              <User className="h-3.5 w-3.5" />
              <span>Assigned To</span>
            </div>
            <div className="flex items-center gap-1.5 pl-2 text-white">
              <div className="w-4 h-4 bg-gray-600 rounded-full text-[8px] flex items-center justify-center">
                {chat.assignedTo.substring(0, 2).toUpperCase()}
              </div>
              {chat.assignedTo}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <h3 className="text-sm font-semibold text-white mb-4">Lead Status</h3>
          <div className="relative flex justify-between items-center mb-6">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-alliance-border"></div>
            
            {/* Progress bar logic based on currentStepIndex */}
            {currentStepIndex >= 0 && (
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-alliance-green transition-all duration-300" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            )}
            
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative flex flex-col items-center gap-2 z-10 group cursor-pointer">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-alliance-green flex items-center justify-center shadow-[0_0_10px_rgba(14,166,100,0.3)] ring-4 ring-alliance-card">
                      <Check className="h-3 w-3 text-[#092b1d] stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-alliance-border border-2 border-alliance-muted group-hover:border-white transition-colors ring-4 ring-alliance-card"></div>
                  )}
                  <span className={clsx(
                    "text-[9px] font-medium absolute -bottom-4 whitespace-nowrap transition-colors",
                    isCurrent ? "text-alliance-green" : isCompleted ? "text-white" : "text-alliance-muted group-hover:text-white"
                  )}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <ThumbsUp className="h-3.5 w-3.5 text-alliance-muted" />
              Mark Interested
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <Calendar className="h-3.5 w-3.5 text-alliance-muted" />
              Schedule Follow-up
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <User className="h-3.5 w-3.5 text-alliance-muted" />
              Assign Counselor
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <FileText className="h-3.5 w-3.5 text-alliance-muted" />
              Send Brochure
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <Edit3 className="h-3.5 w-3.5 text-alliance-muted" />
              Add Note
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-lg border border-alliance-border bg-alliance-dark text-alliance-text hover:bg-alliance-border hover:text-white transition-colors">
              <Download className="h-3.5 w-3.5 text-alliance-muted" />
              Export Lead
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

