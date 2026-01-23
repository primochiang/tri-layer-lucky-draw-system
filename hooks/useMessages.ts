import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

const MAX_MESSAGES = 100;

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load initial messages (most recent 50)
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

    // Subscribe to new inserts
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
    const { error } = await supabase
      .from('messages')
      .insert({ nickname, content });
    return !error;
  }, []);

  const clearMessages = useCallback(async () => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      setMessages([]);
    }
    return !error;
  }, []);

  return { messages, isConnected, sendMessage, clearMessages };
}
