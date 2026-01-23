import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Participant } from '../types';

interface DbParticipantRow {
  id: string;
  name: string;
  club: string;
  zone: string;
  title: string | null;
  created_at: string;
}

function dbToParticipant(row: DbParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    club: row.club,
    zone: row.zone,
    title: row.title || undefined,
  };
}

export function useParticipants(initialParticipants: Participant[]) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isLoading, setIsLoading] = useState(true);
  const syncingRef = useRef(false);

  // Load initial data from Supabase
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setParticipants((data as DbParticipantRow[]).map(dbToParticipant));
      }
      setIsLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel('participants-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'participants' },
        (payload) => {
          if (syncingRef.current) return;
          const newRow = payload.new as DbParticipantRow;
          setParticipants(prev => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [...prev, dbToParticipant(newRow)];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'participants' },
        (payload) => {
          if (syncingRef.current) return;
          const oldRow = payload.old as { id: string };
          setParticipants(prev => prev.filter(p => p.id !== oldRow.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync participants to Supabase (replace all)
  const syncParticipants = useCallback(async (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    if (!supabase) return false;

    syncingRef.current = true;

    // Clear existing
    await supabase
      .from('participants')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z');

    // Insert new
    if (newParticipants.length > 0) {
      // Supabase has a limit on batch inserts, chunk into 500
      const CHUNK_SIZE = 500;
      for (let i = 0; i < newParticipants.length; i += CHUNK_SIZE) {
        const chunk = newParticipants.slice(i, i + CHUNK_SIZE);
        const rows = chunk.map(p => ({
          id: p.id,
          name: p.name,
          club: p.club,
          zone: p.zone,
          title: p.title || null,
        }));

        const { error } = await supabase.from('participants').insert(rows);
        if (error) {
          console.error('[useParticipants] sync error:', error);
          syncingRef.current = false;
          return false;
        }
      }
    }

    syncingRef.current = false;
    return true;
  }, []);

  return { participants, syncParticipants, isLoading };
}
