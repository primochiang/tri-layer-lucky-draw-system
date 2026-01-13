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
  prizeItem?: string; // New field for detailed item name (e.g., "iPhone 15")
  timestamp: number;
  context: string; // e.g., "Zone 1" or "Taipei Club" or "All"
}

export interface PrizeConfig {
  id: string;
  name: string;     // e.g. "頭獎"
  itemName?: string; // e.g. "iPhone 15 Pro"
  totalCount: number;
  image?: string;   // Base64 string for prize image
}

export interface DrawConfig {
  prizeName: string;
  count: number;
}