import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WinnerRecord, LayerType } from '../types';

interface DbWinnerRow {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_club: string;
  participant_zone: string;
  layer: string;
  prize: string;
  prize_id: string;
  prize_item: string;
  context: string;
  created_at: string;
}

function dbToRecord(row: DbWinnerRow): WinnerRecord {
  return {
    id: row.id,
    participantId: row.participant_id,
    participantName: row.participant_name,
    participantClub: row.participant_club,
    participantZone: row.participant_zone,
    layer: row.layer as LayerType,
    prize: row.prize,
    prizeId: row.prize_id,
    prizeItem: row.prize_item || '',
    timestamp: new Date(row.created_at).getTime(),
    context: row.context,
  };
}

function recordToDb(record: WinnerRecord): Omit<DbWinnerRow, 'created_at'> {
  return {
    id: record.id,
    participant_id: record.participantId,
    participant_name: record.participantName,
    participant_club: record.participantClub,
    participant_zone: record.participantZone,
    layer: record.layer,
    prize: record.prize,
    prize_id: record.prizeId,
    prize_item: record.prizeItem || '',
    context: record.context,
  };
}

export function useWinners() {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWinners((data as DbWinnerRow[]).map(dbToRecord));
      }
      setIsLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel('winners-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'winners' },
        (payload) => {
          const newRow = payload.new as DbWinnerRow;
          setWinners(prev => {
            if (prev.some(w => w.id === newRow.id)) return prev;
            return [dbToRecord(newRow), ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'winners' },
        (payload) => {
          const oldRow = payload.old as { id: string };
          setWinners(prev => prev.filter(w => w.id !== oldRow.id));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const insertWinners = useCallback(async (records: WinnerRecord[]) => {
    const rows = records.map(recordToDb);
    setWinners(prev => {
      const newIds = new Set(records.map(r => r.id));
      const filtered = prev.filter(w => !newIds.has(w.id));
      return [...records, ...filtered];
    });
    if (!supabase) return false;
    const { error } = await supabase.from('winners').insert(rows);
    return !error;
  }, []);

  const deleteWinner = useCallback(async (id: string) => {
    setWinners(prev => prev.filter(w => w.id !== id));
    if (!supabase) return false;
    const { error } = await supabase.from('winners').delete().eq('id', id);
    return !error;
  }, []);

  const clearAllWinners = useCallback(async () => {
    setWinners([]);
    if (!supabase) return false;
    const { error } = await supabase
      .from('winners')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z');
    return !error;
  }, []);

  return { winners, setWinners, isLoading, isConnected, insertWinners, deleteWinner, clearAllWinners };
}
