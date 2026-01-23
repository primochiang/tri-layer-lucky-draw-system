import React, { useEffect, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Message } from '../types';

interface DanmakuSidebarProps {
  messages: Message[];
  isConnected: boolean;
  onClose: () => void;
}

const NICKNAME_COLORS = [
  'text-pink-400', 'text-amber-400', 'text-blue-400',
  'text-emerald-400', 'text-purple-400', 'text-rose-400',
  'text-cyan-400', 'text-orange-400'
];

function getNicknameColor(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NICKNAME_COLORS[Math.abs(hash) % NICKNAME_COLORS.length];
}

export const DanmakuSidebar: React.FC<DanmakuSidebarProps> = ({ messages, isConnected, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const audienceUrl = `${window.location.origin}/audience`;

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

      {/* QR Code Section */}
      <div className="flex-none p-4 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800/20 to-transparent border-b border-slate-700/30">
        <div className="bg-white p-2 rounded-lg shadow-lg mb-2 transform hover:scale-105 transition-transform duration-300">
          <QRCodeSVG value={audienceUrl} size={96} />
        </div>
        <p className="text-amber-400 font-bold text-xs tracking-wider animate-pulse">掃碼加入聊天</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto p-3 space-y-2 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="text-center text-slate-500 text-sm mt-6">
              等待觀眾留言中...
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="animate-fade-in">
              <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50 hover:bg-slate-800 transition-colors shadow-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`font-bold text-xs ${getNicknameColor(msg.nickname)}`}>{msg.nickname}</span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-white text-sm leading-relaxed break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div className="h-4"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/20 text-center">
        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
          {isConnected ? '即時連線中...' : '連線中斷'}
        </div>
      </div>
    </div>
  );
};
