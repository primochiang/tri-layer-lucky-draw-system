import * as XLSX from 'xlsx';
import { Participant, ImportResult, ImportError, ParsedPrizeData } from '../types';
import { ClubPrizeConfig, ZonePrizeConfig, DistrictPrizeConfig } from '../prizes';
import { PrizeConfig } from '../types';

/**
 * Parse participants from an xlsx file.
 * Expected columns: 編號, 姓名, 社團, 分區, 職稱
 */
export const parseParticipantsFile = async (file: File): Promise<ImportResult<Participant[]>> => {
  const errors: ImportError[] = [];
  const data = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(data, { type: 'array' });

  // Find the sheet named '參加者名單' or use the first sheet
  const sheetName = workbook.SheetNames.includes('參加者名單')
    ? '參加者名單'
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    return { success: false, data: [], errors: [{ row: 0, column: '', message: '找不到有效的工作表' }] };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  if (rows.length === 0) {
    return { success: false, data: [], errors: [{ row: 0, column: '', message: '工作表內無資料' }] };
  }

  const participants: Participant[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Excel row (1-based header + data)
    const name = String(row['姓名'] || '').trim();
    const club = String(row['社團'] || '').trim();
    const zone = String(row['分區'] || '').trim();
    const id = row['編號'] ? String(row['編號']).trim() : `p-${rowNum}`;
    const title = row['職稱'] ? String(row['職稱']).trim() : undefined;

    if (!name) {
      errors.push({ row: rowNum, column: '姓名', message: '姓名為必填' });
      return;
    }
    if (!club) {
      errors.push({ row: rowNum, column: '社團', message: '社團為必填' });
      return;
    }
    if (!zone) {
      errors.push({ row: rowNum, column: '分區', message: '分區為必填' });
      return;
    }

    participants.push({ id, name, club, zone, title });
  });

  return {
    success: errors.length === 0,
    data: participants,
    errors
  };
};

/**
 * Derive zone-club mapping from participant list.
 */
export const deriveZoneClubMapping = (participants: Participant[]): Record<string, string[]> => {
  const mapping: Record<string, Set<string>> = {};

  participants.forEach(p => {
    if (!mapping[p.zone]) {
      mapping[p.zone] = new Set();
    }
    mapping[p.zone].add(p.club);
  });

  const result: Record<string, string[]> = {};
  Object.entries(mapping).forEach(([zone, clubs]) => {
    result[zone] = Array.from(clubs).sort();
  });

  return result;
};

/**
 * Parse prizes from an xlsx file.
 * Expected columns: 階段, 分區, 社團, 贊助人, 獎項名稱, 獎品內容, 數量
 */
export const parsePrizesFile = async (file: File): Promise<ImportResult<ParsedPrizeData>> => {
  const errors: ImportError[] = [];
  const data = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(data, { type: 'array' });

  const sheetName = workbook.SheetNames.includes('獎項清單')
    ? '獎項清單'
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    return {
      success: false,
      data: { clubPrizes: [], zonePrizes: [], districtPrizes: [] },
      errors: [{ row: 0, column: '', message: '找不到有效的工作表' }]
    };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  if (rows.length === 0) {
    return {
      success: false,
      data: { clubPrizes: [], zonePrizes: [], districtPrizes: [] },
      errors: [{ row: 0, column: '', message: '工作表內無資料' }]
    };
  }

  // Group rows by stage
  const stage1Rows: Array<{ row: Record<string, any>; rowNum: number }> = [];
  const stage2Rows: Array<{ row: Record<string, any>; rowNum: number }> = [];
  const stage3Rows: Array<{ row: Record<string, any>; rowNum: number }> = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const stage = String(row['階段'] || '').trim();

    if (!stage) {
      errors.push({ row: rowNum, column: '階段', message: '階段為必填' });
      return;
    }

    if (stage.includes('第一階段')) {
      stage1Rows.push({ row, rowNum });
    } else if (stage.includes('第二階段')) {
      stage2Rows.push({ row, rowNum });
    } else if (stage.includes('第三階段')) {
      stage3Rows.push({ row, rowNum });
    } else {
      errors.push({ row: rowNum, column: '階段', message: `無法辨識的階段: ${stage}（需包含「第一階段」「第二階段」或「第三階段」）` });
    }
  });

  // Parse stage 1 → Club Prizes (Layer C)
  const clubPrizes = parseClubPrizes(stage1Rows, errors);

  // Parse stage 2 → Zone Prizes (Layer B)
  const zonePrizes = parseZonePrizes(stage2Rows, errors);

  // Parse stage 3 → District Prizes (Layer A)
  const districtPrizes = parseDistrictPrizes(stage3Rows, errors);

  return {
    success: errors.length === 0,
    data: { clubPrizes, zonePrizes, districtPrizes },
    errors
  };
};

function parseClubPrizes(
  rows: Array<{ row: Record<string, any>; rowNum: number }>,
  errors: ImportError[]
): ClubPrizeConfig[] {
  // Group by zone + club
  const groupMap = new Map<string, ClubPrizeConfig>();

  rows.forEach(({ row, rowNum }) => {
    const zone = String(row['分區'] || '').trim();
    const club = String(row['社團'] || '').trim();
    const sponsor = String(row['贊助人'] || '').trim();
    const prizeName = String(row['獎項名稱'] || '').trim();
    const itemName = String(row['獎品內容'] || '').trim();
    const count = parseInt(String(row['數量'] || '0')) || 0;

    if (!zone) { errors.push({ row: rowNum, column: '分區', message: '分區為必填' }); return; }
    if (!club) { errors.push({ row: rowNum, column: '社團', message: '社團為必填' }); return; }

    const key = `${zone}-${club}`;
    const id = generatePrizeId('c', zone, club, groupMap.get(key)?.prizes.length || 0);

    const prize: PrizeConfig = {
      id,
      name: prizeName || '社長獎',
      itemName: itemName || undefined,
      totalCount: count,
      sponsor: sponsor || undefined
    };

    if (groupMap.has(key)) {
      groupMap.get(key)!.prizes.push(prize);
    } else {
      groupMap.set(key, {
        zone,
        club,
        sponsor,
        prizes: [prize]
      });
    }
  });

  return Array.from(groupMap.values());
}

function parseZonePrizes(
  rows: Array<{ row: Record<string, any>; rowNum: number }>,
  errors: ImportError[]
): ZonePrizeConfig[] {
  const groupMap = new Map<string, ZonePrizeConfig>();

  rows.forEach(({ row, rowNum }) => {
    const zone = String(row['分區'] || '').trim();
    const sponsor = String(row['贊助人'] || '').trim();
    const prizeName = String(row['獎項名稱'] || '').trim();
    const itemName = String(row['獎品內容'] || '').trim();
    const count = parseInt(String(row['數量'] || '0')) || 0;

    if (!zone) { errors.push({ row: rowNum, column: '分區', message: '分區為必填' }); return; }

    const key = `${zone}-${sponsor}`;
    const id = generatePrizeId('z', zone, sponsor, groupMap.get(key)?.prizes.length || 0);

    const prize: PrizeConfig = {
      id,
      name: prizeName || '分區長官獎',
      itemName: itemName || undefined,
      totalCount: count,
      sponsor: sponsor || undefined
    };

    if (groupMap.has(key)) {
      groupMap.get(key)!.prizes.push(prize);
    } else {
      groupMap.set(key, {
        zone,
        title: '',
        sponsor: sponsor || '',
        prizes: [prize]
      });
    }
  });

  return Array.from(groupMap.values());
}

function parseDistrictPrizes(
  rows: Array<{ row: Record<string, any>; rowNum: number }>,
  _errors: ImportError[]
): DistrictPrizeConfig[] {
  const groupMap = new Map<string, DistrictPrizeConfig>();

  rows.forEach(({ row }) => {
    const sponsor = String(row['贊助人'] || '').trim();
    const prizeName = String(row['獎項名稱'] || '').trim();
    const itemName = String(row['獎品內容'] || '').trim();
    const count = parseInt(String(row['數量'] || '0')) || 0;

    const key = sponsor;
    const id = generatePrizeId('d', sponsor, groupMap.get(key)?.prizes.length || 0);

    const prize: PrizeConfig = {
      id,
      name: prizeName || '特別獎',
      itemName: itemName || undefined,
      totalCount: count,
      sponsor: sponsor || undefined
    };

    if (groupMap.has(key)) {
      groupMap.get(key)!.prizes.push(prize);
    } else {
      groupMap.set(key, {
        title: '',
        sponsor: sponsor || '',
        prizes: [prize]
      });
    }
  });

  return Array.from(groupMap.values());
}

function generatePrizeId(prefix: string, ...parts: (string | number)[]): string {
  const slug = parts
    .map(p => String(p).replace(/\s+/g, '').toLowerCase())
    .join('-');
  return `${prefix}-${slug}-${Date.now().toString(36).slice(-4)}`;
}

/**
 * Build prize getter functions from parsed prize data (equivalent to the hardcoded versions).
 */
export const buildPrizeGetters = (data: ParsedPrizeData) => {
  const getFlatClubPrizes = (club: string): PrizeConfig[] => {
    const config = data.clubPrizes.find(p => p.club === club);
    return config ? config.prizes : [];
  };

  const getFlatZonePrizes = (zone: string): PrizeConfig[] => {
    const configs = data.zonePrizes.filter(p => p.zone === zone);
    return configs.flatMap(c => c.prizes);
  };

  const getFlatDistrictPrizes = (): PrizeConfig[] => {
    return data.districtPrizes.flatMap(d => d.prizes);
  };

  return { getFlatClubPrizes, getFlatZonePrizes, getFlatDistrictPrizes };
};

/**
 * Generate participants template xlsx.
 */
export const generateParticipantsTemplate = (): Blob => {
  const wb = XLSX.utils.book_new();
  const data = [
    { '編號': '001', '姓名': '王小明', '社團': '南區社', '分區': '第一分區', '職稱': '社長' },
    { '編號': '002', '姓名': '李大華', '社團': '逸仙社', '分區': '第一分區', '職稱': '社員' },
    { '編號': '003', '姓名': '張美玲', '社團': '南欣社', '分區': '第四分區', '職稱': '社員' },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '參加者名單');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Generate prizes template xlsx.
 */
export const generatePrizesTemplate = (): Blob => {
  const wb = XLSX.utils.book_new();
  const data = [
    { '階段': '第一階段', '分區': '第一分區', '社團': '南區社', '贊助人': 'Queenie', '獎項名稱': '社長獎', '獎品內容': '紅包 $2,000', '數量': 3 },
    { '階段': '第二階段', '分區': '第一分區', '社團': '', '贊助人': 'Catherine', '獎項名稱': '分區長官獎', '獎品內容': '日式健走杖', '數量': 1 },
    { '階段': '第三階段', '分區': '', '社團': '', '贊助人': 'Jenny', '獎項名稱': '總監獎', '獎品內容': '皇家禮炮威士忌酒', '數量': 1 },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '獎項清單');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
