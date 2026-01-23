import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useThrottle } from '../hooks/useThrottle';

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

export const AudiencePage: React.FC = () => {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('audience_nickname') || '';
  });
  const [content, setContent] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(() => {
    return !!localStorage.getItem('audience_nickname');
  });

  const { messages, isConnected, sendMessage } = useMessages();
  const { canProceed, markSent, remainingSeconds, isCooling } = useThrottle();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSetNickname = () => {
    const trimmed = nickname.trim();
    if (trimmed.length >= 1 && trimmed.length <= 20) {
      localStorage.setItem('audience_nickname', trimmed);
      setNickname(trimmed);
      setIsNicknameSet(true);
    }
  };

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !canProceed()) return;
    const success = await sendMessage(nickname, trimmedContent);
    if (success) {
      setContent('');
      markSent();
    }
  };

  if (!isNicknameSet) {
    return (
      <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">現場互動留言</h1>
            <p className="text-slate-400 text-sm">輸入暱稱後即可開始留言</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              onKeyDown={(e) => e.key === 'Enter' && handleSetNickname()}
              placeholder="請輸入暱稱 (1-20字)"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-base"
              autoFocus
            />
            <button
              onClick={handleSetNickname}
              disabled={nickname.trim().length < 1}
              className="w-full py-3 bg-amber-500 text-slate-900 font-bold rounded-xl disabled:opacity-50 transition-colors"
            >
              開始留言
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recentMessages = messages.slice(-50);

  return (
    <div className="h-dvh flex flex-col bg-slate-900">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span className="text-white font-bold text-sm">現場互動留言</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-slate-400 text-xs truncate max-w-[80px]">{nickname}</span>
          <button
            onClick={() => { localStorage.removeItem('audience_nickname'); setIsNicknameSet(false); setNickname(''); }}
            className="text-slate-500 text-xs underline"
          >
            更換
          </button>
        </div>
      </div>

      {/* Messages - simple scrollable area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {recentMessages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            目前還沒有留言，快來第一個留言吧！
          </div>
        )}
        {recentMessages.map((msg) => (
          <div key={msg.id} className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-baseline justify-between mb-1">
              <span className={`font-bold text-xs ${getNicknameColor(msg.nickname)}`}>
                {msg.nickname}
              </span>
              <span className="text-slate-500 text-[10px]">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-white text-sm break-words">{msg.content}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 100))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isCooling ? `${remainingSeconds}秒後可再發送...` : '輸入留言...'}
            disabled={isCooling}
            className="flex-1 min-w-0 px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base disabled:opacity-50"
            maxLength={100}
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || isCooling}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-amber-500 text-slate-900 rounded-xl disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between mt-1 px-1">
          <span className="text-slate-500 text-[10px]">{content.length}/100</span>
          {isCooling && <span className="text-amber-400 text-[10px]">{remainingSeconds}s</span>}
        </div>
      </div>
    </div>
  );
};
