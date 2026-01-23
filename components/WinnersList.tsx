import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WinnerRecord, LayerType } from '../types';
import { Edit, Check, Trash2, PanelLeft, PanelBottom, QrCode, Search } from 'lucide-react';

interface WinnersListProps {
  winners: WinnerRecord[];
  currentLayer: LayerType;
  variant?: 'default' | 'sidebar'; // default: fixed height, sidebar: full height
  onDeleteWinner: (id: string) => void;
  onTogglePosition?: () => void;
}

export const WinnersList: React.FC<WinnersListProps> = ({ 
  winners, 
  currentLayer, 
  variant = 'default',
  onDeleteWinner,
  onTogglePosition
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const winnersUrl = `${window.location.origin}/winners`;

  const layerWinners = winners
    .filter(w => w.layer === currentLayer)
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        w.participantName.toLowerCase().includes(q) ||
        w.participantClub.toLowerCase().includes(q) ||
        w.participantZone.toLowerCase().includes(q) ||
        w.prize.toLowerCase().includes(q) ||
        (w.prizeItem && w.prizeItem.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (layerWinners.length === 0) {
    return (
      <div className={`bg-white/90 backdrop-blur rounded-xl p-8 text-center border border-slate-200 text-slate-400 ${variant === 'sidebar' ? 'h-full flex items-center justify-center relative' : 'relative'}`}>
        {/* Toggle button even when empty */}
        {onTogglePosition && (
          <div className="absolute top-2 right-2">
             <button 
              onClick={onTogglePosition}
              className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title={variant === 'default' ? "切換至左側顯示" : "切換至下方顯示"}
            >
              {variant === 'default' ? <PanelLeft className="w-5 h-5" /> : <PanelBottom className="w-5 h-5" />}
            </button>
          </div>
        )}
        目前本層級尚無得獎名單
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${variant === 'sidebar' ? 'h-full rounded-none border-y-0 border-l-0 border-r' : ''}`}>
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-none">
        <h3 className="font-bold text-slate-700">本層級得獎名單 ({layerWinners.length})</h3>
        <div className="flex items-center gap-2">
          {variant === 'default' && (
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className={`p-1.5 rounded transition-colors ${showQr ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
              title="顯示 QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          {onTogglePosition && (
            <button
              type="button"
              onClick={onTogglePosition}
              className="p-1.5 rounded transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              title={variant === 'default' ? "切換至左側顯示" : "切換至下方顯示"}
            >
              {variant === 'default' ? <PanelLeft className="w-4 h-4" /> : <PanelBottom className="w-4 h-4" />}
            </button>
          )}
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded hidden sm:inline-block">最新在前</span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
            title={isEditing ? "完成編輯" : "編輯名單"}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QR Code Panel */}
      {showQr && variant === 'default' && (
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-center gap-4">
          <QRCodeSVG value={winnersUrl} size={96} bgColor="#fffbeb" fgColor="#1e293b" />
          <div className="text-sm text-amber-800">
            <div className="font-bold mb-1">掃碼查詢中獎名單</div>
            <div className="text-xs text-amber-600 break-all">{winnersUrl}</div>
          </div>
        </div>
      )}
      
      {variant === 'sidebar' && (
        <div className="px-3 py-2 border-b border-slate-200 flex-none">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋姓名、社團、獎項..."
              className="w-full pl-7 pr-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>
        </div>
      )}

      <div className={`overflow-y-auto ${variant === 'default' ? 'max-h-[400px]' : 'flex-1'}`}>
        {variant === 'sidebar' ? (
          <div className="divide-y divide-slate-100 px-3 py-1">
            {layerWinners.map((winner) => (
              <div key={winner.id} className="py-2 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-600 font-medium truncate">{winner.prize}{winner.prizeItem ? ` - ${winner.prizeItem}` : ''}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-800">{winner.participantName}</span>
                    <span className="text-xs text-slate-400 truncate">{winner.participantClub}</span>
                  </div>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onDeleteWinner(winner.id)}
                    className="flex-none mt-1 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    title="刪除此紀錄"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-sm">
              <tr>
                {isEditing && <th className="p-3 w-16 text-center text-red-500 font-bold">刪除</th>}
                <th className="p-3">獎項</th>
                <th className="p-3">獎品</th>
                <th className="p-3">得獎者</th>
                <th className="p-3">所屬單位</th>
                <th className="p-3">分區</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {layerWinners.map((winner) => (
                <tr key={winner.id} className="hover:bg-slate-50 transition-colors">
                  {isEditing && (
                    <td className="p-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWinner(winner.id);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-red-200"
                        title="刪除此紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                  <td className="p-3 font-medium text-amber-600 truncate max-w-[100px]">{winner.prize}</td>
                  <td className="p-3 text-slate-500 truncate max-w-[120px]" title={winner.prizeItem || ''}>{winner.prizeItem || '-'}</td>
                  <td className="p-3 font-bold text-slate-800">{winner.participantName}</td>
                  <td className="p-3 text-slate-600 truncate max-w-[120px]">{winner.participantClub}</td>
                  <td className="p-3 text-slate-500">{winner.participantZone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};