import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface UseRealtimeMessagesProps {
  threadId: string;
  currentUserId: string;
  initialMessages: Message[];
  onNewMessage?: (message: Message) => void;
}

export function useRealtimeMessages({
  threadId,
  currentUserId,
  initialMessages,
  onNewMessage,
}: UseRealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(true);

  // Sync messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Handle real-time message updates
  const handleRealtimeMessage = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newMessage = payload.new;
      
      // Only add if it's not from current user (to avoid duplicates with optimistic updates)
      if (newMessage.sender_id !== currentUserId) {
        const messageWithSender: Message = {
          id: newMessage.id,
          content: newMessage.content,
          type: newMessage.type,
          readAt: newMessage.read_at,
          createdAt: newMessage.created_at,
          sender: {
            id: newMessage.sender_id,
            name: null, // Will be populated by the component
            avatar: null,
          },
        };
        
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) return prevMessages;
          
          const updatedMessages = [...prevMessages, messageWithSender];
          onNewMessage?.(messageWithSender);
          return updatedMessages;
        });
      }
    }
  }, [currentUserId, onNewMessage]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        handleRealtimeMessage
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, handleRealtimeMessage]);

  const addOptimisticMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const removeOptimisticMessage = useCallback((messageId: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  return {
    messages,
    isConnected,
    addOptimisticMessage,
    removeOptimisticMessage,
    updateMessage,
    setMessages,
  };
}