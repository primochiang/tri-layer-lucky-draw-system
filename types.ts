export enum LayerType {
  A = 'A', // Grand Draw (All)
  B = 'B', // Zone Draw
  C = 'C'  // Club Draw
}

export interface Participant {
  id: string;
  name: string;
  club: string;
  zone: string; // "1", "4", "5"
  title?: string;
}

export interface WinnerRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantClub: string;
  participantZone: string;
  layer: LayerType;
  prize: string;
  prizeId: string; // Unique prize ID to distinguish same-named prizes
  prizeItem?: string; // New field for detailed item name (e.g., "iPhone 15")
  timestamp: number;
  context: string; // e.g., "Zone 1" or "Taipei Club" or "All"
}

export interface PrizeConfig {
  id: string;
  name: string;     // e.g. "頭獎"
  itemName?: string; // e.g. "iPhone 15 Pro"
  totalCount: number;
  sponsor?: string; // e.g. "P Queenie" - 贊助人
  sponsorTitle?: string; // e.g. "DG" - 贊助人職稱
}

export interface DrawConfig {
  prizeName: string;
  count: number;
}

export interface ImportResult<T> {
  success: boolean;
  data: T;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
}

export interface ParsedPrizeData {
  clubPrizes: import('./prizes').ClubPrizeConfig[];
  zonePrizes: import('./prizes').ZonePrizeConfig[];
  districtPrizes: import('./prizes').DistrictPrizeConfig[];
}