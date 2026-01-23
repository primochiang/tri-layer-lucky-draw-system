import React, { useState, useMemo } from 'react';
import { Trophy, Search, Wifi, WifiOff } from 'lucide-react';
import { useWinners } from '../hooks/useWinners';

const LAYER_LABELS: Record<string, string> = {
  ALL: '全部',
  A: '全體抽獎',
  B: '分區抽獎',
  C: '社團抽獎',
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-amber-400/30 text-amber-300 font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export const WinnersPage: React.FC = () => {
  const { winners, isLoading, isConnected } = useWinners();
  const [search, setSearch] = useState('');
  const [layerFilter, setLayerFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    let list = winners;
    if (layerFilter !== 'ALL') {
      list = list.filter(w => w.layer === layerFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w => w.participantName.toLowerCase().includes(q));
    }
    return list;
  }, [winners, layerFilter, search]);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-900 text-white flex flex-col box-border">
      {/* Header */}
      <header className="flex-none px-4 py-4 bg-slate-800/80 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold">中獎名單查詢</h1>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-slate-400">
              {isConnected ? '即時同步中' : '連線中...'}
            </span>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex-none px-4 py-3 bg-slate-800/40 border-b border-slate-700/30">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="輸入姓名搜尋..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
          </div>

          {/* Layer tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {['ALL', 'A', 'B', 'C'].map(key => (
              <button
                key={key}
                onClick={() => setLayerFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  layerFilter === key
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {LAYER_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-3"></div>
              載入中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              {search ? '找不到符合的結果' : '目前尚無中獎名單'}
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-400 mb-3">
                共 {filtered.length} 筆結果
              </div>

              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-2">
                {filtered.map(w => (
                  <div key={w.id} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 overflow-hidden max-w-full">
                    <div className="text-amber-400 text-xs font-medium truncate mb-1">
                      {LAYER_LABELS[w.layer]} / {w.prize}
                    </div>
                    {w.prizeItem && (
                      <div className="text-slate-400 text-xs truncate mb-1">{w.prizeItem}</div>
                    )}
                    <div className="flex items-baseline gap-2 min-w-0 max-w-full">
                      <span className="font-bold text-white truncate">
                        {highlightMatch(w.participantName, search)}
                      </span>
                      <span className="text-xs text-slate-400 truncate shrink-0 max-w-[40%]">{w.participantClub}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">{w.participantZone}</div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="pb-2 pr-4">層級</th>
                      <th className="pb-2 pr-4">獎項</th>
                      <th className="pb-2 pr-4">獎品</th>
                      <th className="pb-2 pr-4">得獎者</th>
                      <th className="pb-2 pr-4">單位</th>
                      <th className="pb-2">分區</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filtered.map(w => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 pr-4 text-xs text-slate-400">{LAYER_LABELS[w.layer]}</td>
                        <td className="py-2.5 pr-4 text-amber-400 font-medium">{w.prize}</td>
                        <td className="py-2.5 pr-4 text-slate-300">{w.prizeItem || '-'}</td>
                        <td className="py-2.5 pr-4 font-bold text-white">
                          {highlightMatch(w.participantName, search)}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 max-w-[150px] truncate">{w.participantClub}</td>
                        <td className="py-2.5 text-slate-400">{w.participantZone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none px-4 py-2 border-t border-slate-700/30 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-500">
          即時更新 - 抽獎結果將自動同步顯示
        </div>
      </footer>
    </div>
  );
};
