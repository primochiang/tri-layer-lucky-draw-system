import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';

interface DanmakuOverlayProps {
  messages: Message[];
}

interface FlyingItem {
  id: string;
  nickname: string;
  content: string;
  lane: number;
  duration: number;
  color: string;
}

const LANE_COUNT = 8;
const COLORS = [
  'text-pink-300', 'text-amber-300', 'text-blue-300',
  'text-emerald-300', 'text-purple-300', 'text-rose-300',
  'text-cyan-300', 'text-orange-300'
];

function getNicknameColor(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export const DanmakuOverlay: React.FC<DanmakuOverlayProps> = ({ messages }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const processedRef = useRef<Set<string>>(new Set());
  const laneUsageRef = useRef<number[]>(new Array(LANE_COUNT).fill(0));

  // Pick a lane that hasn't been used recently
  const pickLane = (): number => {
    const now = Date.now();
    let bestLane = 0;
    let oldestTime = Infinity;
    for (let i = 0; i < LANE_COUNT; i++) {
      if (laneUsageRef.current[i] < oldestTime) {
        oldestTime = laneUsageRef.current[i];
        bestLane = i;
      }
    }
    laneUsageRef.current[bestLane] = now;
    return bestLane;
  };

  useEffect(() => {
    // Process new messages
    const newMessages = messages.filter(m => !processedRef.current.has(m.id));
    if (newMessages.length === 0) return;

    const newItems: FlyingItem[] = newMessages.map(msg => {
      processedRef.current.add(msg.id);
      return {
        id: msg.id,
        nickname: msg.nickname,
        content: msg.content,
        lane: pickLane(),
        duration: 8 + Math.random() * 4, // 8-12 seconds
        color: getNicknameColor(msg.nickname),
      };
    });

    setFlyingItems(prev => [...prev, ...newItems]);

    // Keep processedRef from growing unbounded
    if (processedRef.current.size > 200) {
      const arr = Array.from(processedRef.current);
      processedRef.current = new Set(arr.slice(arr.length - 100));
    }
  }, [messages]);

  // Cleanup finished animations
  useEffect(() => {
    if (flyingItems.length === 0) return;
    const timer = setInterval(() => {
      setFlyingItems(prev => {
        if (prev.length > 50) {
          return prev.slice(prev.length - 30);
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [flyingItems.length > 0]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {flyingItems.map(item => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap danmaku-fly"
          style={{
            top: `${(item.lane / LANE_COUNT) * 80 + 5}%`,
            animationDuration: `${item.duration}s`,
          }}
          onAnimationEnd={() => {
            setFlyingItems(prev => prev.filter(f => f.id !== item.id));
          }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-sm shadow-lg">
            <span className={`font-bold ${item.color}`}>{item.nickname}</span>
            <span className="text-white/90">{item.content}</span>
          </span>
        </div>
      ))}
    </div>
  );
};
