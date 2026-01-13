import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Heart, Sparkles, Smile, PartyPopper } from 'lucide-react';

interface DanmakuSidebarProps {
  isOpen: boolean; // Kept for logic, though parent handles rendering now
  onClose: () => void;
}

interface MockMessage {
  id: string;
  name: string;
  text: string;
  color: string;
  icon: React.ReactNode;
}

const NAMES = ['陳社長', '林總監', '王大明', '快樂獅友', '分區小幫手', '幸運星', '李大哥', '張大姐', '熱心志工'];
const MESSAGES = [
  '恭喜得獎！太幸運了！',
  '下一個就是我！',
  '活動辦得真好，氣氛超棒！',
  '大家辛苦了～',
  '145分區 加油加油！',
  '我要把大獎搬回家！',
  '那個電視看起來好讚',
  '恭喜！沾沾喜氣',
  '社長好帥！',
  '再來一個加碼！',
  '這畫面設計得很有質感耶',
  '期待幸運獎～'
];
const COLORS = ['text-pink-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400', 'text-purple-400'];

export const DanmakuSidebar: React.FC<DanmakuSidebarProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Simulation Logic
  useEffect(() => {
    // Initial messages
    if (messages.length === 0) {
       const initial = Array.from({ length: 3 }).map(() => generateMessage());
       setMessages(initial);
    }

    const interval = setInterval(() => {
      setMessages(prev => {
        const newMsg = generateMessage();
        // Keep only last 50 messages to prevent memory issues
        const updated = [...prev, newMsg];
        if (updated.length > 50) updated.shift();
        return updated;
      });
    }, 2500); // New message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateMessage = (): MockMessage => {
    const randomIconIdx = Math.floor(Math.random() * 4);
    const icons = [
      <Heart className="w-4 h-4" key="1" />, 
      <Sparkles className="w-4 h-4" key="2" />, 
      <Smile className="w-4 h-4" key="3" />, 
      <PartyPopper className="w-4 h-4" key="4" />
    ];

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      text: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      icon: icons[randomIconIdx]
    };
  };

  // Simplified layout structure to fit into a flex container (not fixed anymore)
  return (
    <div className="h-full flex flex-col bg-slate-800/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex-none p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
        <h2 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          現場互動留言
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
          title="關閉留言區"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* QR Code Section - Compact for sidebar */}
      <div className="flex-none p-4 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800/20 to-transparent border-b border-slate-700/30">
        <div className="bg-white p-1.5 rounded-lg shadow-lg mb-2 transform hover:scale-105 transition-transform duration-300">
           <img 
             src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/event/chat" 
             alt="Scan to Chat" 
             className="w-24 h-24"
           />
        </div>
        <p className="text-amber-400 font-bold text-xs tracking-wider animate-pulse">掃碼加入聊天</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto p-3 space-y-2 custom-scrollbar"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="animate-fade-in-up">
              <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50 hover:bg-slate-800 transition-colors shadow-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`font-bold text-xs ${msg.color}`}>{msg.name}</span>
                  <span className="text-slate-500 text-[10px]">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="text-white text-sm leading-relaxed flex items-center gap-2 break-words">
                  {msg.text}
                  <span className="opacity-70">{msg.icon}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="h-4"></div> {/* Spacer */}
        </div>
        
        {/* Gradient Overlay for bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
      </div>

      {/* Footer / Input Simulation */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/20 text-center">
         <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            即時連線中...
         </div>
      </div>
    </div>
  );
};