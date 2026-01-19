import { Participant } from './types';

// Re-export all prize configurations
export * from './prizes';

// 分區與社團對應表
export const ZONE_CLUBS: Record<string, string[]> = {
  '第一分區': ['南區', '逸仙', '逸天', '雲聯網', '逸澤', '黃埔', '逸新', '蘭亭鐵馬', '銀河'],
  '第四分區': ['南欣', '松山', '民生', '松青', '政愛', '添愛', '泰愛', '文化'],
  '第五分區': ['府門', '南陽', '明星', '風雲'],
};

export const ZONES = Object.keys(ZONE_CLUBS);

// Helper to generate mock data since we don't have a real backend
const generateMockParticipants = (): Participant[] => {
  const membersPerClub = 20; // approx members per club

  const participants: Participant[] = [];
  let idCounter = 1;

  Object.entries(ZONE_CLUBS).forEach(([zone, clubs]) => {
    clubs.forEach(clubName => {
      for (let m = 1; m <= membersPerClub; m++) {
        participants.push({
          id: `p-${idCounter++}`,
          name: `社員 ${idCounter - 1}`, // Generic name
          club: clubName,
          zone: zone,
          title: m === 1 ? '社長' : '社員'
        });
      }
    });
  });

  return participants;
};

export const MOCK_PARTICIPANTS = generateMockParticipants();

// Extract unique clubs from participants
export const getClubs = (participants: Participant[]): string[] => {
  return Array.from(new Set(participants.map(p => p.club))).sort();
};

// Extract clubs filtered by zone
export const getClubsByZone = (participants: Participant[], zone: string): string[] => {
  return Array.from(new Set(participants.filter(p => p.zone === zone).map(p => p.club))).sort();
};
