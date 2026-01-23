import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

const MAX_MESSAGES = 100;

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setMessages(data.reverse());
      }
    };

    loadInitial();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            const updated = [...prev, newMsg];
            if (updated.length > MAX_MESSAGES) {
              return updated.slice(updated.length - MAX_MESSAGES);
            }
            return updated;
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = useCallback(async (nickname: string, content: string) => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('messages')
      .insert({ nickname, content });
    return !error;
  }, []);

  const clearMessages = useCallback(async () => {
    if (!supabase) return false;
    const { error } = await supabase
      .from('messages')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z');
    if (error) {
      console.error('Failed to clear messages from Supabase:', error);
    } else {
      setMessages([]);
    }
    return !error;
  }, []);

  return { messages, isConnected, sendMessage, clearMessages };
}
