import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LayerType, Participant, WinnerRecord, PrizeConfig } from './types';
import {
  MOCK_PARTICIPANTS,
  ZONES,
  getClubs,
  getFlatClubPrizes,
  getFlatZonePrizes,
  getFlatDistrictPrizes
} from './constants';
import { LayerSelector } from './components/LayerSelector';
import { SlotMachine } from './components/SlotMachine';
import { WinnersList } from './components/WinnersList';
import { Modal } from './components/Modal';
import { DanmakuSidebar } from './components/DanmakuSidebar'; // Import Danmaku
import { getEligibleParticipants, drawWinners } from './services/lotteryService';
import confetti from 'canvas-confetti';
import { 
  Trash2, Settings, Play, X, Menu, Image as ImageIcon, 
  Type, Monitor, ChevronRight, Award, Plus, Minus,
  Maximize, Minimize, LayoutTemplate, AlignVerticalJustifyCenter, AlignHorizontalJustifyStart,
  Upload, Gift, MessageSquare
} from 'lucide-react';

const App: React.FC = () => {
  // --- Core State ---
  const [participants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [currentLayer, setCurrentLayer] = useState<LayerType>(LayerType.A);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true);
  const [isDanmakuOpen, setIsDanmakuOpen] = useState<boolean>(false); // Danmaku State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });

  // New Layout State
  const [winnersPosition, setWinnersPosition] = useState<'BOTTOM' | 'LEFT'>('BOTTOM');

  // Filter States
  const [selectedZone, setSelectedZone] = useState<string>(ZONES[0]);
  const [selectedClub, setSelectedClub] = useState<string>('');

  // --- Prize Management State ---
  // Initialize with district prizes for Layer A
  const [prizes, setPrizes] = useState<PrizeConfig[]>(() => getFlatDistrictPrizes());
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>(''); // Default to empty
  const [drawMode, setDrawMode] = useState<'ONE' | 'ALL' | 'CUSTOM'>('ONE');
  const [customBatchSize, setCustomBatchSize] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastDrawWinners, setLastDrawWinners] = useState<Participant[]>([]);

  // --- Presentation State ---
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSlogan, setCustomSlogan] = useState<string>('熱情 • 服務 • 創新 • 榮耀');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  
  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-update Title based on context AND Reset Prize Selection
  useEffect(() => {
    if (currentLayer === LayerType.A) {
      setCustomTitle('一四五分區 聯合大抽獎');
    } else if (currentLayer === LayerType.B) {
      setCustomTitle(`${selectedZone} 幸運抽獎`);
    } else if (currentLayer === LayerType.C) {
      setCustomTitle(selectedClub ? `${selectedClub}社 幸運抽獎` : '各社抽獎');
    }

    // Reset prize selection when layer or context changes
    setSelectedPrizeId('');
  }, [currentLayer, selectedZone, selectedClub]);

  // Dynamic Prize Loading based on Layer and Context
  useEffect(() => {
    let newPrizes: PrizeConfig[] = [];

    if (currentLayer === LayerType.A) {
      // Layer A: 第三階段 - 特別獎 (地區長官獎)
      newPrizes = getFlatDistrictPrizes();
    } else if (currentLayer === LayerType.B) {
      // Layer B: 第二階段 - 分區長官獎
      newPrizes = getFlatZonePrizes(selectedZone);
    } else if (currentLayer === LayerType.C && selectedClub) {
      // Layer C: 第一階段 - 社長獎
      newPrizes = getFlatClubPrizes(selectedClub);
    }

    setPrizes(newPrizes);
    setSelectedPrizeId('');
  }, [currentLayer, selectedZone, selectedClub]);

  // Init Club selection
  useEffect(() => {
    if (currentLayer === LayerType.C && !selectedClub) {
        const clubs = getClubs(participants);
        if (clubs.length > 0) setSelectedClub(clubs[0]);
    }
  }, [currentLayer, participants, selectedClub]);

  // --- Derived Logic (Prize & Candidates) ---

  const currentPrize = useMemo(() => 
    prizes.find(p => p.id === selectedPrizeId) // Can be undefined now
  , [prizes, selectedPrizeId]);

  const prizeWinnersCount = useMemo(() => {
    if (!currentPrize) return 0;
    return winners.filter(w => w.prize === currentPrize.name && w.layer === currentLayer).length;
  }, [winners, currentPrize, currentLayer]);

  const remainingPrizeCount = currentPrize 
    ? Math.max(0, currentPrize.totalCount - prizeWinnersCount)
    : 0;

  const filterValue = useMemo(() => {
    if (currentLayer === LayerType.A) return undefined;
    if (currentLayer === LayerType.B) return selectedZone;
    if (currentLayer === LayerType.C) return selectedClub;
    return undefined;
  }, [currentLayer, selectedZone, selectedClub]);

  const eligibleCandidates = useMemo(() => {
    return getEligibleParticipants(participants, winners, currentLayer, filterValue);
  }, [participants, winners, currentLayer, filterValue]);

  // Determine actual draw count based on mode
  const actualDrawCount = useMemo(() => {
    if (drawMode === 'ONE') return 1;
    if (drawMode === 'ALL') return remainingPrizeCount;
    return Math.min(customBatchSize, remainingPrizeCount);
  }, [drawMode, customBatchSize, remainingPrizeCount]);

  // --- Handlers ---

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Helper to show modals
  const showModal = (type: 'alert' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
    setModalConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // The actual draw execution logic
  const executeDraw = () => {
    setIsDrawing(true);
    setLastDrawWinners([]);
    // Auto close settings for visual impact
    setIsSettingsOpen(false); 
  };

  const handleStartDraw = () => {
    if (!currentPrize) {
      showModal('alert', '提醒', '請先選擇一個獎項');
      return;
    }
    if (eligibleCandidates.length === 0) {
      showModal('alert', '無符合資格者', '目前設定範圍內已無符合資格的參加者！');
      return;
    }
    if (remainingPrizeCount <= 0) {
      showModal('alert', '獎項已抽完', `「${currentPrize.name}」的名額已全數抽出！`);
      return;
    }
    
    // Ensure we don't try to draw more than eligible people
    if (actualDrawCount > eligibleCandidates.length) {
       showModal(
         'confirm', 
         '人數不足提醒', 
         `符合資格人數 (${eligibleCandidates.length}) 少於預計抽出人數 (${actualDrawCount})，是否全部抽出？`,
         executeDraw // Pass the execution function as callback
       );
       return;
    }

    // Standard execution if no confirmation needed
    executeDraw();
  };

  const handleStopDraw = () => {
    if (!isDrawing) return;

    // Safety check on count
    const finalCount = Math.min(actualDrawCount, eligibleCandidates.length);
    const newWinners = drawWinners(eligibleCandidates, finalCount);
    
    setIsDrawing(false);
    setLastDrawWinners(newWinners);

    const newRecords: WinnerRecord[] = newWinners.map(p => ({
      id: crypto.randomUUID(),
      participantId: p.id,
      participantName: p.name,
      participantClub: p.club,
      participantZone: p.zone,
      layer: currentLayer,
      prize: currentPrize?.name || '未知獎項',
      prizeItem: currentPrize?.itemName || '', // Added detailed item name
      timestamp: Date.now(),
      context: currentLayer === LayerType.A ? '全體' : filterValue || '未知'
    }));

    setWinners(prev => [...newRecords, ...prev]);

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#ef4444', '#3b82f6', '#ffffff']
    });
  };

  const handleAddBonus = () => {
    if (!currentPrize) return;
    
    // Add 1 to the current prize count
    setPrizes(prev => prev.map(p => 
      p.id === currentPrize.id 
        ? { ...p, totalCount: p.totalCount + 1 } 
        : p
    ));

    // Small celebration effect for the bonus
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8b5cf6', '#ec4899'] // Purple/Pink
    });
  };

  const handleResetLayer = () => {
    showModal(
      'confirm', 
      '清除確認', 
      '確定要清除目前層級的所有得獎名單嗎？此操作無法復原。',
      () => setWinners(prev => prev.filter(w => w.layer !== currentLayer))
    );
  };

  const handleDeleteWinner = (recordId: string) => {
    showModal(
      'confirm',
      '刪除得獎紀錄',
      '確定要刪除此筆得獎紀錄嗎？刪除後名額將自動歸還，需要重新抽獎。',
      () => setWinners(prev => prev.filter(w => w.id !== recordId))
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCustomImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Prize Management Handlers
  const addPrize = () => {
    const newId = `p-${Date.now()}`;
    setPrizes([...prizes, { id: newId, name: '新獎項', itemName: '', totalCount: 1 }]);
    setSelectedPrizeId(newId);
  };

  const updatePrize = (id: string, field: keyof PrizeConfig, value: any) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handlePrizeImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePrize(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deletePrize = (id: string) => {
    if (prizes.length <= 1) return;
    const newPrizes = prizes.filter(p => p.id !== id);
    setPrizes(newPrizes);
    if (selectedPrizeId === id) setSelectedPrizeId(newPrizes[0].id);
  };

  // --- Render Helpers ---

  // The main drawing stage content (reused in both layouts)
  const renderStage = () => (
    <div className="w-full flex flex-col items-center justify-center py-10 min-h-min">
      {/* 1. Branding Header & Prize Display */}
      <div className="text-center mb-8 w-full animate-fade-in-down px-4">
        {customImage ? (
          <div className="mb-4 h-32 md:h-40 flex items-center justify-center">
            <img 
              src={customImage} 
              alt="Unit Logo" 
              className="h-full w-auto max-w-full object-contain drop-shadow-2xl"
            />
          </div>
        ) : (
           <div className="h-8"></div>
        )}
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 drop-shadow-sm mb-4">
          {customTitle}
        </h1>
        <p className="text-2xl md:text-4xl text-amber-400 font-bold tracking-wide mb-12 drop-shadow-md">
          {customSlogan}
        </p>

        {/* CURRENT PRIZE BANNER */}
        {currentPrize ? (
          <div className="inline-block relative group animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 px-12 py-4 rounded-xl shadow-2xl transform transition-transform hover:scale-105 border border-amber-400/30">
              {currentPrize.sponsor && (
                <div className="text-amber-100 text-sm font-bold uppercase tracking-[0.2em] mb-1">
                  {currentPrize.sponsorTitle} {currentPrize.sponsor} 敬贈
                </div>
              )}
              <div className="text-4xl md:text-6xl font-black text-white drop-shadow-md">
                 {currentPrize.name}
              </div>
              <div className="mt-2 text-amber-100 font-medium">
                 名額：{remainingPrizeCount} / {currentPrize.totalCount}
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-block relative px-12 py-6 rounded-xl border-2 border-dashed border-slate-600/30 bg-slate-800/30 text-slate-400">
             <div className="text-xl md:text-2xl font-bold tracking-widest animate-pulse">
                請選擇抽獎獎項
             </div>
          </div>
        )}
      </div>

      {/* 2. Slot Machine Area */}
      <div className="w-full mb-10 px-4">
        <SlotMachine 
          key={`${currentLayer}-${selectedPrizeId}`} // Force remount to reset display on context switch
          candidates={eligibleCandidates} 
          isDrawing={isDrawing} 
          onDrawComplete={() => {}}
          drawCount={Math.min(actualDrawCount, eligibleCandidates.length > 0 ? eligibleCandidates.length : 1)}
        />
      </div>

      {/* 3. Main Action Button & Bonus Button */}
      <div className="mb-8 px-4 flex justify-center gap-4 items-center">
        {!isDrawing ? (
          <>
            {/* Standard Draw / Sold Out Button */}
            <button 
              onClick={handleStartDraw}
              disabled={!currentPrize || eligibleCandidates.length === 0 || remainingPrizeCount === 0}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-2xl font-bold text-white transition-all duration-200 rounded-full focus:outline-none shadow-lg
                ${remainingPrizeCount === 0 
                  ? 'bg-slate-600 cursor-not-allowed opacity-80 shadow-none' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)] grayscale disabled:grayscale'
                }
              `}
            >
              {remainingPrizeCount === 0 ? (
                <span className="flex items-center"><X className="w-6 h-6 mr-2"/> 已抽完</span>
              ) : (
                <>
                  <Play className="w-8 h-8 mr-3 fill-current" />
                  <span>
                    {!currentPrize ? "請選擇獎項" : `抽出 ${Math.min(actualDrawCount, eligibleCandidates.length || 1)} 位`}
                  </span>
                </>
              )}
            </button>
            
            {/* Bonus Button (Only appears when sold out) */}
            {currentPrize && remainingPrizeCount === 0 && (
              <button
                onClick={handleAddBonus}
                className="relative inline-flex items-center justify-center px-6 py-4 text-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] animate-pulse active:scale-95 shadow-lg"
                title="增加一個名額"
              >
                <Plus className="w-6 h-6 mr-2" />
                加碼
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                  +1
                </span>
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={handleStopDraw}
            className="inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-slate-900 transition-all duration-200 bg-amber-400 rounded-full hover:bg-amber-300 hover:scale-105 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse"
          >
            停止並揭曉
          </button>
        )}
      </div>

      {/* 4. Prize Display (Image & Names) - Fixed Height */}
      {currentPrize ? (
        <div className="mb-16 w-full max-w-lg px-4 animate-fade-in-up">
           <div className="relative w-full h-[300px] bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center overflow-hidden p-4 shadow-xl">
              {currentPrize.image ? (
                <img 
                  src={currentPrize.image} 
                  alt={currentPrize.name} 
                  className="h-[180px] w-full object-contain mb-2 drop-shadow-lg"
                />
              ) : (
                <div className="h-[180px] w-full flex items-center justify-center text-slate-500 bg-slate-800/50 rounded-lg mb-2 border border-slate-700/30 border-dashed">
                   <ImageIcon className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="w-full text-center mt-2">
                 <p className="text-2xl font-bold text-amber-400 mt-1 truncate drop-shadow-md">
                   {currentPrize.itemName || "獎品內容"}
                 </p>
              </div>
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 p-2 opacity-50">
                 <Gift className="w-6 h-6 text-slate-600" />
              </div>
           </div>
        </div>
      ) : (
        <div className="mb-16 w-full max-w-lg px-4 h-[300px] flex items-center justify-center opacity-30">
          {/* Empty Placeholder to keep layout spacing if needed, or remove for cleaner look */}
          <div className="text-slate-500 font-light flex flex-col items-center">
            <Gift className="w-16 h-16 mb-2" />
            <span>準備抽獎...</span>
          </div>
        </div>
      )}

      {/* 5. Footer Winners List (Only for BOTTOM mode) */}
      {winnersPosition === 'BOTTOM' && (
        <div className="w-full max-w-5xl bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden mb-10 shadow-2xl px-4 mx-auto">
           <WinnersList 
            winners={winners} 
            currentLayer={currentLayer} 
            variant="default" 
            onDeleteWinner={handleDeleteWinner}
            onTogglePosition={() => setWinnersPosition('LEFT')}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-slate-900 text-white overflow-hidden font-sans flex flex-col">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-600/20 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      {/* Top Bar */}
      <header className="flex-none flex justify-between items-center p-6 z-20 relative">
          <div className="flex items-center space-x-2 opacity-50">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm tracking-widest font-light">一四五分區活動抽獎系統</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Danmaku Toggle */}
            <button
               onClick={() => setIsDanmakuOpen(!isDanmakuOpen)}
               className={`p-2 rounded-full backdrop-blur transition-all shadow-lg border ${
                 isDanmakuOpen 
                   ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-amber-400/20' 
                   : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'
               }`}
               title="留言彈幕區"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen}
              className="text-slate-500 hover:text-white transition-colors opacity-40 hover:opacity-100"
              title={isFullscreen ? "離開全螢幕" : "全螢幕"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {!isSettingsOpen && (
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full backdrop-blur transition-all shadow-lg border border-slate-700"
                title="開啟設定"
              >
                <Settings className="w-6 h-6 text-slate-300" />
              </button>
            )}
          </div>
      </header>

      {/* --- Main Content Area --- */}
      <main 
        className={`
          relative z-10 flex-grow flex overflow-hidden
          transition-all duration-300 ease-in-out
          ${isSettingsOpen ? 'lg:mr-[400px]' : ''}
          flex-col lg:flex-row
        `}
      >
        {/* Left Panel Winners List (Only for LEFT mode) */}
        {winnersPosition === 'LEFT' && (
          <div className="w-full lg:w-[320px] xl:w-[350px] flex-none border-b lg:border-b-0 lg:border-r border-slate-700/50 bg-slate-800/30 backdrop-blur-sm z-20 order-2 lg:order-1 h-1/3 lg:h-full overflow-hidden">
             <WinnersList 
              winners={winners} 
              currentLayer={currentLayer} 
              variant="sidebar" 
              onDeleteWinner={handleDeleteWinner}
              onTogglePosition={() => setWinnersPosition('BOTTOM')}
            />
          </div>
        )}

        {/* Center Stage Container */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar relative order-1 lg:order-2 ${winnersPosition === 'LEFT' ? 'w-full' : ''}`}>
           <div className="min-h-full flex flex-col w-full max-w-7xl mx-auto">
             {renderStage()}
           </div>
        </div>

        {/* Right Panel Danmaku (New) */}
        {isDanmakuOpen && (
           <div className="w-full lg:w-[300px] xl:w-[320px] flex-none border-t lg:border-t-0 border-slate-700/50 z-20 order-3 h-1/3 lg:h-full overflow-hidden animate-fade-in">
             <DanmakuSidebar 
               isOpen={isDanmakuOpen} 
               onClose={() => setIsDanmakuOpen(false)} 
             />
           </div>
        )}

      </main>

      {/* --- Settings Sidebar --- */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full lg:w-[400px] bg-white text-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSettingsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex-none flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold flex items-center text-slate-800">
            <Settings className="w-5 h-5 mr-2" />
            系統控制台
          </h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. Layer Selection */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">抽獎層級 & 範圍</h3>
            <div className="space-y-4">
              <LayerSelector currentLayer={currentLayer} setLayer={setCurrentLayer} vertical={true} />
              
              {/* Context Filters */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                {currentLayer === LayerType.A && (
                  <div className="text-sm text-slate-600 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1 text-slate-400" />
                    全體
                  </div>
                )}
                {currentLayer === LayerType.B && (
                  <select 
                    value={selectedZone} 
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                  >
                    {ZONES.map(z => <option key={z} value={z}>第 {z} 分區</option>)}
                  </select>
                )}
                {currentLayer === LayerType.C && (
                   <select 
                    value={selectedClub} 
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                   >
                     {getClubs(participants).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                )}
                <div className="mt-2 text-right text-xs font-medium text-emerald-600">
                   符合資格：{eligibleCandidates.length} 人
                </div>
              </div>
            </div>
          </section>

          {/* 2. Prize Selection & Execution (NEW) */}
          <section className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center">
               <Award className="w-4 h-4 mr-1" /> 抽獎執行
            </h3>
            
            <div className="space-y-4">
              {/* Select Prize */}
              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-1">選擇獎項</label>
                <select
                  value={selectedPrizeId}
                  onChange={(e) => setSelectedPrizeId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-base font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value="">-- 請選擇獎項 --</option>
                  {prizes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.sponsorTitle} {p.sponsor} (共 {p.totalCount} 名)
                    </option>
                  ))}
                </select>
                {currentPrize && (
                  <div className="mt-2 p-2 bg-amber-100/50 rounded text-xs text-amber-800">
                    <div className="font-bold">贊助人：{currentPrize.sponsorTitle} {currentPrize.sponsor}</div>
                    <div>獎品：{currentPrize.itemName}</div>
                    <div className="flex justify-between mt-1">
                      <span>剩餘: {remainingPrizeCount}</span>
                      <span>總數: {currentPrize.totalCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Draw Mode */}
              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-2">抽出數量設定</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDrawMode('ONE')}
                    className={`p-2 rounded-lg text-sm font-medium border transition-all
                      ${drawMode === 'ONE' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-50'}`}
                  >
                    抽一位
                  </button>
                  <button
                    onClick={() => setDrawMode('ALL')}
                    className={`p-2 rounded-lg text-sm font-medium border transition-all
                      ${drawMode === 'ALL' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-50'}`}
                  >
                    全梭 (All)
                  </button>
                  <button
                    onClick={() => setDrawMode('CUSTOM')}
                    className={`p-2 rounded-lg text-sm font-medium border transition-all
                      ${drawMode === 'CUSTOM' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-50'}`}
                  >
                    自訂
                  </button>
                </div>

                {drawMode === 'CUSTOM' && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-slate-600 mr-2">數量:</span>
                    <input 
                      type="number" 
                      min="1"
                      max={remainingPrizeCount}
                      value={customBatchSize}
                      onChange={(e) => setCustomBatchSize(parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-amber-200 rounded-lg text-center font-bold"
                    />
                  </div>
                )}
                
                <div className="mt-2 text-xs text-amber-700 bg-amber-100/50 p-2 rounded">
                  本次將抽出：<span className="font-bold text-lg">{Math.min(actualDrawCount, eligibleCandidates.length)}</span> 位
                </div>
              </div>
            </div>
          </section>

          {/* 3. Prize Management */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">獎項設定管理</h3>
               <button 
                onClick={addPrize}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center"
               >
                 <Plus className="w-3 h-3 mr-1" /> 新增
               </button>
             </div>
             
             <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
               {prizes.map((prize) => (
                 <div key={prize.id} className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-grow space-y-2">
                        <input 
                          type="text" 
                          value={prize.name}
                          onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                          className="w-full p-1 text-sm border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent font-bold text-slate-700 placeholder-slate-300"
                          placeholder="獎項名稱 (如: 頭獎)"
                        />
                        <input 
                          type="text" 
                          value={prize.itemName || ''}
                          onChange={(e) => updatePrize(prize.id, 'itemName', e.target.value)}
                          className="w-full p-1 text-xs border-b border-slate-100 focus:border-blue-400 outline-none bg-transparent text-slate-600 placeholder-slate-300"
                          placeholder="獎品內容 (如: iPhone 15)"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex items-center gap-1 bg-slate-100 rounded px-1">
                          <span className="text-[10px] text-slate-400">名額</span>
                          <input 
                            type="number" 
                            min="1"
                            value={prize.totalCount}
                            onChange={(e) => updatePrize(prize.id, 'totalCount', parseInt(e.target.value) || 1)}
                            className="w-10 p-1 text-sm text-center bg-transparent outline-none font-bold text-slate-700"
                          />
                        </div>
                        {prizes.length > 1 && (
                          <button 
                            onClick={() => deletePrize(prize.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Prize Image Uploader */}
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-2 mt-1">
                       {prize.image ? (
                         <div className="relative group w-10 h-10 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={prize.image} alt="prize" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => updatePrize(prize.id, 'image', undefined)}
                              className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                       ) : (
                         <div className="w-10 h-10 rounded bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                           <ImageIcon className="w-5 h-5" />
                         </div>
                       )}
                       
                       <label className="flex-1 cursor-pointer">
                          <span className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium">
                            <Upload className="w-3 h-3 mr-1" />
                            {prize.image ? '更換圖片' : '上傳獎品圖片'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*"
                            hidden
                            onChange={(e) => handlePrizeImageUpload(prize.id, e)}
                          />
                       </label>
                    </div>
                 </div>
               ))}
             </div>
          </section>

          {/* 4. Visual Settings */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <Monitor className="w-4 h-4 mr-1" />
              螢幕顯示設定
            </h3>
            
            <div className="space-y-4">
              {/* Layout Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">得獎名單位置</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setWinnersPosition('BOTTOM')}
                      className={`flex items-center justify-center p-2 rounded border transition-all ${winnersPosition === 'BOTTOM' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignHorizontalJustifyStart className="w-4 h-4 mr-2 rotate-90" />
                      下方
                    </button>
                    <button 
                      onClick={() => setWinnersPosition('LEFT')}
                      className={`flex items-center justify-center p-2 rounded border transition-all ${winnersPosition === 'LEFT' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignVerticalJustifyCenter className="w-4 h-4 mr-2 rotate-180" />
                      左側
                    </button>
                </div>
                {winnersPosition === 'LEFT' && (
                  <p className="text-[10px] text-amber-600 mt-1">※ 左側佈局適合寬螢幕，可顯示較多名單</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">活動標題</label>
                <input 
                    type="text" 
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                  />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">精神標語</label>
                <input 
                  type="text" 
                  value={customSlogan}
                  onChange={(e) => setCustomSlogan(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">單位形象圖片</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-300 border-dashed rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    {customImage ? '更換' : '上傳'}
                  </button>
                  {customImage && (
                    <button 
                      onClick={removeImage}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="移除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </section>

           {/* Footer Tools */}
           <div className="pt-6 border-t border-slate-200">
             <button 
                onClick={handleResetLayer}
                className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除本層級紀錄
              </button>
          </div>
        </div>

        {/* Sidebar Footer Action */}
        <div className="flex-none p-4 border-t border-slate-200 bg-slate-50">
           <button 
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold transition-colors shadow-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              完成設定 (收起選單)
            </button>
        </div>
      </aside>

      {/* Settings Backdrop (Mobile Only) */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSettingsOpen(false)}
        ></div>
      )}

      {/* Global Custom Modal */}
      <Modal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onClose={closeModal}
      />
    </div>
  );
};

export default App;