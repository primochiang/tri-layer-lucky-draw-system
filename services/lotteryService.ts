import { Participant, WinnerRecord, LayerType } from '../types';

/**
 * Gets eligible participants based on the specific rules of the event.
 * 
 * Rules:
 * 1. Activity A (All): All participants, excluding those who already won in Activity A.
 * 2. Activity B (Zone): Participants in specific Zone, excluding those who already won in Activity B.
 * 3. Activity C (Club): Participants in specific Club, excluding those who already won in Activity C.
 * 
 * Cross-activity winning is ALLOWED (Winning in A doesn't disqualify from B or C).
 */
export const getEligibleParticipants = (
  allParticipants: Participant[],
  pastWinners: WinnerRecord[],
  layer: LayerType,
  filterValue?: string // Zone ID for B, Club Name for C
): Participant[] => {
  
  // 1. Identify IDs of people who have already won IN THIS LAYER
  const winnerIdsInThisLayer = new Set(
    pastWinners
      .filter(w => w.layer === layer)
      .map(w => w.participantId)
  );

  // 2. Base Filter
  let candidates = allParticipants;

  if (layer === LayerType.B) {
    if (!filterValue) return []; // Must select a zone
    candidates = candidates.filter(p => p.zone === filterValue);
  } else if (layer === LayerType.C) {
    if (!filterValue) return []; // Must select a club
    candidates = candidates.filter(p => p.club === filterValue);
  }

  // 3. Exclusion Filter (Remove winners from THIS layer)
  candidates = candidates.filter(p => !winnerIdsInThisLayer.has(p.id));

  return candidates;
};

/**
 * Randomly selects N winners from the candidates using the Fisher-Yates shuffle algorithm
 * for better randomness than simple Math.random sort.
 */
export const drawWinners = (candidates: Participant[], count: number): Participant[] => {
  if (candidates.length === 0) return [];
  
  // Clone to avoid mutating original
  const deck = [...candidates];
  
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.slice(0, Math.min(count, deck.length));
};
