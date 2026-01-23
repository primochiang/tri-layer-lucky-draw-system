import React, { useEffect, useState, useRef } from 'react';
import { Participant } from '../types';
import confetti from 'canvas-confetti';

interface SlotMachineProps {
  candidates: Participant[];
  isDrawing: boolean;
  onDrawComplete: (winners: Participant[]) => void;
  drawCount: number;
  drawnWinners: Participant[];
}

export const SlotMachine: React.FC<SlotMachineProps> = ({
  candidates,
  isDrawing,
  onDrawComplete,
  drawCount,
  drawnWinners
}) => {
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Handle the animation loop
  useEffect(() => {
    if (isDrawing && candidates.length > 0) {
      // Start fast shuffling
      intervalRef.current = window.setInterval(() => {
        const randomPicks = Array.from({ length: drawCount }, () => {
          const randomIndex = Math.floor(Math.random() * candidates.length);
          return candidates[randomIndex].name;
        });
        setDisplayNames(randomPicks);
      }, 50);
    } else {
      // Stop shuffling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDrawing, candidates, drawCount]);

  // Sync display with drawnWinners state
  useEffect(() => {
    if (!isDrawing) {
      if (drawnWinners.length > 0) {
        setDisplayNames(drawnWinners.map(w => w.name));
      } else {
        setDisplayNames([]);
      }
    }
  }, [drawnWinners, isDrawing]);


  // Helper for grid layout based on count
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  // Don't render slots if no draw has happened yet and not currently drawing
  if (!isDrawing && displayNames.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className={`grid ${getGridClass(displayNames.length)} gap-4`}>
        {displayNames.map((name, index) => (
          <div
            key={index}
            className={`border-4 rounded-xl p-6 shadow-lg flex items-center justify-center transform transition-transform hover:scale-105 ${
              !isDrawing && drawnWinners.length > 0
                ? 'bg-amber-50 border-amber-500'
                : 'bg-white border-amber-400'
            }`}
          >
            <span className={`font-bold text-slate-800 ${displayNames.length > 5 ? 'text-xl' : 'text-3xl'} truncate`}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {isDrawing && (
        <div className="text-center mt-8 text-white text-xl animate-pulse font-bold">
          抽獎進行中...
        </div>
      )}
    </div>
  );
};
