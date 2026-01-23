import React, { useRef, useState } from 'react';
import { Participant, ImportError, ParsedPrizeData } from '../types';
import {
  parseParticipantsFile,
  parsePrizesFile,
  generateParticipantsTemplate,
  generatePrizesTemplate,
  deriveZoneClubMapping
} from '../services/importService';
import { Upload, Download, RotateCcw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImportPanelProps {
  onParticipantsImported: (participants: Participant[], zoneClubs: Record<string, string[]>) => void;
  onPrizesImported: (data: ParsedPrizeData) => void;
  onResetToDefaults: () => void;
}

export const ImportPanel: React.FC<ImportPanelProps> = ({
  onParticipantsImported,
  onPrizesImported,
  onResetToDefaults
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [participantStatus, setParticipantStatus] = useState<{
    loaded: boolean;
    count: number;
    errors: ImportError[];
  }>({ loaded: false, count: 0, errors: [] });
  const [prizeStatus, setPrizeStatus] = useState<{
    loaded: boolean;
    clubCount: number;
    zoneCount: number;
    districtCount: number;
    errors: ImportError[];
  }>({ loaded: false, clubCount: 0, zoneCount: 0, districtCount: 0, errors: [] });
  const [isLoading, setIsLoading] = useState(false);

  const participantFileRef = useRef<HTMLInputElement>(null);
  const prizeFileRef = useRef<HTMLInputElement>(null);

  const handleParticipantsFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await parseParticipantsFile(file);
      if (result.data.length > 0) {
        const zoneClubs = deriveZoneClubMapping(result.data);
        onParticipantsImported(result.data, zoneClubs);
        setParticipantStatus({
          loaded: true,
          count: result.data.length,
          errors: result.errors
        });
      } else {
        setParticipantStatus({
          loaded: false,
          count: 0,
          errors: result.errors.length > 0 ? result.errors : [{ row: 0, column: '', message: '未找到有效資料' }]
        });
      }
    } catch (err) {
      setParticipantStatus({
        loaded: false,
        count: 0,
        errors: [{ row: 0, column: '', message: `檔案讀取失敗: ${err}` }]
      });
    }
    setIsLoading(false);
    if (participantFileRef.current) participantFileRef.current.value = '';
  };

  const handlePrizesFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await parsePrizesFile(file);
      const { clubPrizes, zonePrizes, districtPrizes } = result.data;
      if (clubPrizes.length > 0 || zonePrizes.length > 0 || districtPrizes.length > 0) {
        onPrizesImported(result.data);
        setPrizeStatus({
          loaded: true,
          clubCount: clubPrizes.reduce((sum, c) => sum + c.prizes.reduce((s, p) => s + p.totalCount, 0), 0),
          zoneCount: zonePrizes.reduce((sum, z) => sum + z.prizes.reduce((s, p) => s + p.totalCount, 0), 0),
          districtCount: districtPrizes.reduce((sum, d) => sum + d.prizes.reduce((s, p) => s + p.totalCount, 0), 0),
          errors: result.errors
        });
      } else {
        setPrizeStatus({
          loaded: false,
          clubCount: 0,
          zoneCount: 0,
          districtCount: 0,
          errors: result.errors.length > 0 ? result.errors : [{ row: 0, column: '', message: '未找到有效獎項資料' }]
        });
      }
    } catch (err) {
      setPrizeStatus({
        loaded: false,
        clubCount: 0,
        zoneCount: 0,
        districtCount: 0,
        errors: [{ row: 0, column: '', message: `檔案讀取失敗: ${err}` }]
      });
    }
    setIsLoading(false);
    if (prizeFileRef.current) prizeFileRef.current.value = '';
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadParticipantsTemplate = () => {
    downloadBlob(generateParticipantsTemplate(), '參加者名單範本.xlsx');
  };

  const handleDownloadPrizesTemplate = () => {
    downloadBlob(generatePrizesTemplate(), '獎項清單範本.xlsx');
  };

  const handleReset = () => {
    onResetToDefaults();
    setParticipantStatus({ loaded: false, count: 0, errors: [] });
    setPrizeStatus({ loaded: false, clubCount: 0, zoneCount: 0, districtCount: 0, errors: [] });
  };

  return (
    <section className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
      {/* Header (clickable to toggle) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 transition-colors"
      >
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          資料匯入
        </h3>
        <div className="flex items-center gap-2">
          {participantStatus.loaded && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {participantStatus.count}人
            </span>
          )}
          {prizeStatus.loaded && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              獎項已匯入
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
        </div>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Participants Import */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-blue-700">參加者名單 (.xlsx)</label>
            <div className="flex gap-2">
              <button
                onClick={() => participantFileRef.current?.click()}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                選擇檔案
              </button>
              <input
                ref={participantFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleParticipantsFile}
                className="hidden"
              />
            </div>
            {participantStatus.loaded && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 p-2 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已匯入 {participantStatus.count} 位參加者
              </div>
            )}
            {participantStatus.errors.length > 0 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded space-y-0.5">
                {participantStatus.errors.slice(0, 3).map((e, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>第{e.row}列 {e.column}: {e.message}</span>
                  </div>
                ))}
                {participantStatus.errors.length > 3 && (
                  <div className="text-red-400">...還有 {participantStatus.errors.length - 3} 個錯誤</div>
                )}
              </div>
            )}
          </div>

          {/* Prizes Import */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-blue-700">獎項清單 (.xlsx)</label>
            <div className="flex gap-2">
              <button
                onClick={() => prizeFileRef.current?.click()}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                選擇檔案
              </button>
              <input
                ref={prizeFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handlePrizesFile}
                className="hidden"
              />
            </div>
            {prizeStatus.loaded && (
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  獎項匯入成功
                </div>
                <div className="ml-5 text-green-600">
                  社長獎 {prizeStatus.clubCount} 份 / 分區獎 {prizeStatus.zoneCount} 份 / 特別獎 {prizeStatus.districtCount} 份
                </div>
              </div>
            )}
            {prizeStatus.errors.length > 0 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded space-y-0.5">
                {prizeStatus.errors.slice(0, 3).map((e, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>第{e.row}列 {e.column}: {e.message}</span>
                  </div>
                ))}
                {prizeStatus.errors.length > 3 && (
                  <div className="text-red-400">...還有 {prizeStatus.errors.length - 3} 個錯誤</div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-blue-100">
            <div className="flex gap-2">
              <button
                onClick={handleDownloadParticipantsTemplate}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                名單範本
              </button>
              <button
                onClick={handleDownloadPrizesTemplate}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                獎項範本
              </button>
            </div>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              還原預設資料
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
