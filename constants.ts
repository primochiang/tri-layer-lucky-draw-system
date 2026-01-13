import { Participant } from './types';

// Helper to generate mock data since we don't have a real backend
const generateMockParticipants = (): Participant[] => {
  const zones = ['1', '4', '5'];
  const clubsPerZone = 8; // approx 24 clubs total
  const membersPerClub = 20; // approx 480 people total

  const participants: Participant[] = [];
  let idCounter = 1;

  zones.forEach(zone => {
    for (let c = 1; c <= clubsPerZone; c++) {
      const clubName = `分區${zone}-社團${c}`;
      for (let m = 1; m <= membersPerClub; m++) {
        participants.push({
          id: `p-${idCounter++}`,
          name: `社員 ${idCounter - 1}`, // Generic name
          club: clubName,
          zone: zone,
          title: m === 1 ? '社長' : '社員'
        });
      }
    }
  });

  return participants;
};

export const MOCK_PARTICIPANTS = generateMockParticipants();

export const ZONES = ['1', '4', '5'];

// Extract unique clubs from participants
export const getClubs = (participants: Participant[]): string[] => {
  return Array.from(new Set(participants.map(p => p.club))).sort();
};

// Extract clubs filtered by zone
export const getClubsByZone = (participants: Participant[], zone: string): string[] => {
  return Array.from(new Set(participants.filter(p => p.zone === zone).map(p => p.club))).sort();
};
