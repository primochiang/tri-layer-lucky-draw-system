import React from 'react';
import { LayerType } from '../types';

interface LayerSelectorProps {
  currentLayer: LayerType;
  setLayer: (layer: LayerType) => void;
  vertical?: boolean;
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({ currentLayer, setLayer, vertical = false }) => {
  const layers = [
    { id: LayerType.C, label: '第一階段', desc: '社團抽獎' },
    { id: LayerType.B, label: '第二階段', desc: '分區抽獎' },
    { id: LayerType.A, label: '第三階段', desc: '全體抽獎' },
  ];

  return (
    <div className={`flex gap-3 ${vertical ? 'flex-col' : 'flex-row'}`}>
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => setLayer(layer.id)}
          className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 text-left relative overflow-hidden group
            ${currentLayer === layer.id 
              ? 'bg-red-50 border-red-500 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-red-200 hover:bg-slate-50'
            }`}
        >
          <div className="relative z-10">
            <h3 className={`font-bold text-base ${currentLayer === layer.id ? 'text-red-900' : 'text-slate-700'}`}>
              {layer.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{layer.desc}</p>
          </div>
          {currentLayer === layer.id && (
            <div className="absolute right-0 top-0 h-full w-1.5 bg-red-500"></div>
          )}
        </button>
      ))}
    </div>
  );
};