import React, { useEffect, useState, useRef } from 'react';
import { Participant } from '../types';
import confetti from 'canvas-confetti';

interface SlotMachineProps {
  candidates: Participant[];
  isDrawing: boolean;
  onDrawComplete: (winners: Participant[]) => void;
  drawCount: number;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  candidates, 
  isDrawing, 
  onDrawComplete,
  drawCount 
}) => {
  const [displayNames, setDisplayNames] = useState<string[]>(Array(drawCount).fill("準備中..."));
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
      }, 50); // Speed of shuffle
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

  // Handle the completion (Logic calculation happens here effectively)
  useEffect(() => {
    if (!isDrawing && intervalRef.current === null && candidates.length > 0) {
       // This effect triggers when 'isDrawing' goes from true to false (stopped by parent)
       // OR initially. We need to handle the "Stopping" phase specifically.
       // However, the parent controls the logic. The parent calls setIsDrawing(false) 
       // AND calculates winners. 
       // This component is purely visual in this architecture if the parent passes the winners.
       
       // BUT, to keep the animation sync, usually the parent passes "isDrawing" 
       // and when it stops, we expect the Parent to have already decided the winners 
       // or we decide them here. 
       
       // Let's adjust: The visual "random" names are just effects.
       // The actual winners should be displayed immediately when stopped.
    }
  }, [isDrawing]);


  // Helper for grid layout based on count
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className={`grid ${getGridClass(drawCount)} gap-4`}>
        {displayNames.map((name, index) => (
          <div 
            key={index}
            className="bg-white border-4 border-amber-400 rounded-xl p-6 shadow-lg flex items-center justify-center transform transition-transform hover:scale-105"
          >
            <span className={`font-bold text-slate-800 ${drawCount > 5 ? 'text-xl' : 'text-3xl'} truncate`}>
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
