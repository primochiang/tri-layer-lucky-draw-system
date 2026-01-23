import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { PrizeConfig, LayerType } from '../types';

interface DbPrizeRow {
  id: string;
  name: string;
  item_name: string;
  total_count: number;
  sponsor: string;
  sponsor_title: string;
  layer: string;
  zone: string | null;
  club: string | null;
  created_at: string;
}

function dbToConfig(row: DbPrizeRow): PrizeConfig & { layer: string; zone: string | null; club: string | null } {
  return {
    id: row.id,
    name: row.name,
    itemName: row.item_name || undefined,
    totalCount: row.total_count,
    sponsor: row.sponsor || undefined,
    sponsorTitle: row.sponsor_title || undefined,
    layer: row.layer,
    zone: row.zone,
    club: row.club,
  };
}

export interface StoredPrize extends PrizeConfig {
  layer: string;
  zone: string | null;
  club: string | null;
}

export function usePrizes() {
  const [allPrizes, setAllPrizes] = useState<StoredPrize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const syncingRef = useRef(false);

  // Load initial data and subscribe to real-time changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setAllPrizes((data as DbPrizeRow[]).map(dbToConfig));
      }
      setIsLoading(false);
    };

    loadInitial();

    const channel = supabase
      .channel('prizes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prizes' },
        (payload) => {
          if (syncingRef.current) return;
          const newRow = payload.new as DbPrizeRow;
          setAllPrizes(prev => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [...prev, dbToConfig(newRow)];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'prizes' },
        (payload) => {
          if (syncingRef.current) return;
          const oldRow = payload.old as { id: string };
          setAllPrizes(prev => prev.filter(p => p.id !== oldRow.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get prizes filtered by layer/zone/club
  const getPrizes = useCallback((layer: LayerType, zone?: string, club?: string): PrizeConfig[] => {
    return allPrizes.filter(p => {
      if (p.layer !== layer) return false;
      if (layer === 'B' && zone && p.zone !== zone) return false;
      if (layer === 'C' && club && p.club !== club) return false;
      return true;
    });
  }, [allPrizes]);

  // Sync prizes to Supabase (replace all prizes for a given layer/zone/club context)
  const syncPrizes = useCallback(async (
    prizes: PrizeConfig[],
    layer: LayerType,
    zone?: string,
    club?: string
  ) => {
    if (!supabase) return false;

    syncingRef.current = true;

    // Delete existing prizes for this context
    let deleteQuery = supabase.from('prizes').delete().eq('layer', layer);
    if (layer === 'B' && zone) {
      deleteQuery = deleteQuery.eq('zone', zone);
    } else if (layer === 'C' && club) {
      deleteQuery = deleteQuery.eq('club', club);
    }

    await deleteQuery;

    // Insert new prizes
    if (prizes.length > 0) {
      const rows: Omit<DbPrizeRow, 'created_at'>[] = prizes.map(p => ({
        id: p.id,
        name: p.name,
        item_name: p.itemName || '',
        total_count: p.totalCount,
        sponsor: p.sponsor || '',
        sponsor_title: p.sponsorTitle || '',
        layer,
        zone: zone || null,
        club: club || null,
      }));

      const { error } = await supabase.from('prizes').insert(rows);
      if (error) {
        console.error('[usePrizes] sync error:', error);
        syncingRef.current = false;
        return false;
      }
    }

    // Reload all prizes after sync
    const { data } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setAllPrizes((data as DbPrizeRow[]).map(dbToConfig));
    }

    syncingRef.current = false;
    return true;
  }, []);

  // Bulk sync all prizes at once (used when importing)
  const syncAllPrizes = useCallback(async (
    prizes: { config: PrizeConfig; layer: LayerType; zone?: string; club?: string }[]
  ) => {
    if (!supabase) return false;

    syncingRef.current = true;

    // Clear all existing prizes
    await supabase
      .from('prizes')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z');

    // Insert all new prizes
    if (prizes.length > 0) {
      const rows: Omit<DbPrizeRow, 'created_at'>[] = prizes.map(({ config: p, layer, zone, club }) => ({
        id: p.id,
        name: p.name,
        item_name: p.itemName || '',
        total_count: p.totalCount,
        sponsor: p.sponsor || '',
        sponsor_title: p.sponsorTitle || '',
        layer,
        zone: zone || null,
        club: club || null,
      }));

      const { error } = await supabase.from('prizes').insert(rows);
      if (error) {
        console.error('[usePrizes] bulk sync error:', error);
        syncingRef.current = false;
        return false;
      }
    }

    // Reload
    const { data } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setAllPrizes((data as DbPrizeRow[]).map(dbToConfig));
    }

    syncingRef.current = false;
    return true;
  }, []);

  const clearAllPrizes = useCallback(async () => {
    setAllPrizes([]);
    if (!supabase) return false;
    const { error } = await supabase
      .from('prizes')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z');
    return !error;
  }, []);

  return { allPrizes, isLoading, getPrizes, syncPrizes, syncAllPrizes, clearAllPrizes };
}
