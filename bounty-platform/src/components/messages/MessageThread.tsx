'use client';

import React, { useState, useEffect, useRef, useOptimistic, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages';
import { supabase } from '@/lib/supabase/client';
import { useContextualNotificationPrompt } from '@/components/notifications/PushNotificationManager';
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

interface MessageThreadProps {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
  bounty: {
    id: string;
    title: string;
    client: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
    freelancer: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
  className?: string;
}

interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
  isPending?: boolean;
}

export function MessageThread({
  threadId,
  initialMessages,
  currentUserId,
  bounty,
  className,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { promptForMessages, isSupported: notificationsSupported } = useContextualNotificationPrompt();

  // Sync messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Optimistic updates for messages
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: OptimisticMessage[], newMessage: OptimisticMessage) => [
      ...state,
      newMessage,
    ]
  );

  // Handle real-time message updates
  const handleRealtimeMessage = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newMessage = payload.new;
      
      // Only add if it's not from current user (to avoid duplicates with optimistic updates)
      if (newMessage.sender_id !== currentUserId) {
        // Fetch the complete message with sender details
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) return prevMessages;
          
          // Add the new message with sender info
          // Note: In a real implementation, you might want to fetch the complete message
          // with sender details from the server here
          const messageWithSender: Message = {
            id: newMessage.id,
            content: newMessage.content,
            type: newMessage.type,
            readAt: newMessage.read_at,
            createdAt: newMessage.created_at,
            sender: {
              id: newMessage.sender_id,
              name: bounty.client.id === newMessage.sender_id ? bounty.client.name : bounty.freelancer.name,
              avatar: bounty.client.id === newMessage.sender_id ? bounty.client.avatar : bounty.freelancer.avatar,
            },
          };
          
          return [...prevMessages, messageWithSender];
        });
      }
    }
  }, [currentUserId, bounty]);

  // Real-time message updates
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

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    markMessagesAsRead(threadId);
  }, [threadId, messages]);

  // Prompt for notifications when user starts engaging with messages
  useEffect(() => {
    if (notificationsSupported && messages.length > 0) {
      // Delay the prompt to avoid interrupting the user immediately
      const timer = setTimeout(() => {
        promptForMessages();
      }, 5000); // Show prompt after 5 seconds of being in the conversation

      return () => clearTimeout(timer);
    }
  }, [notificationsSupported, promptForMessages, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [optimisticMessages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Add optimistic message
    const optimisticMsg: OptimisticMessage = {
      id: tempId,
      content: messageContent,
      type: 'TEXT',
      readAt: null,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: bounty.client.id === currentUserId ? bounty.client.name : bounty.freelancer.name,
        avatar: bounty.client.id === currentUserId ? bounty.client.avatar : bounty.freelancer.avatar,
      },
      isOptimistic: true,
      isPending: true,
    };
    
    addOptimisticMessage(optimisticMsg);
    setNewMessage('');
    setIsSending(true);

    try {
      const result = await sendMessage(threadId, messageContent);
      
      if (result.success && result.messageId) {
        // Update the optimistic message with the real message ID
        // The optimistic message will be automatically replaced by the real one from server
        setMessages(prevMessages => {
          return prevMessages.map(msg => 
            msg.id === tempId 
              ? { ...msg, id: result.messageId!, isOptimistic: false, isPending: false } as Message
              : msg
          );
        });
      } else {
        // Remove optimistic message on error and show error
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Remove optimistic message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background-primary', className)}>
      {/* Thread Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background-secondary">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary line-clamp-1">
                {bounty.title}
              </h2>
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isConnected ? "bg-accent-green" : "bg-error"
              )} 
              title={isConnected ? "Connected" : "Disconnected"} 
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-muted">Conversation between</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary-blue text-primary-white text-xs flex items-center justify-center">
                  {bounty.client.avatar ? (
                    <img 
                      src={bounty.client.avatar} 
                      alt={bounty.client.name || 'Client'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    bounty.client.name?.charAt(0).toUpperCase() || 'C'
                  )}
                </div>
                <span className="text-xs text-text-secondary">
                  {bounty.client.name || 'Client'}
                </span>
              </div>
              <span className="text-text-muted">&</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-accent-green text-primary-white text-xs flex items-center justify-center">
                  {bounty.freelancer.avatar ? (
                    <img 
                      src={bounty.freelancer.avatar} 
                      alt={bounty.freelancer.name || 'Freelancer'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    bounty.freelancer.name?.charAt(0).toUpperCase() || 'F'
                  )}
                </div>
                <span className="text-xs text-text-secondary">
                  {bounty.freelancer.name || 'Freelancer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {optimisticMessages.map((message) => {
            const isOwnMessage = message.sender.id === currentUserId;
            const isSystemMessage = message.type === 'SYSTEM';

            if (isSystemMessage) {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex justify-center"
                >
                  <div className="bg-background-muted px-3 py-1 rounded-full text-xs text-text-muted">
                    {message.content}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'flex gap-3',
                  isOwnMessage ? 'justify-end' : 'justify-start'
                )}
              >
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-primary-blue text-primary-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {message.sender.avatar ? (
                      <img 
                        src={message.sender.avatar} 
                        alt={message.sender.name || 'User'} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      message.sender.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                )}

                <div className={cn(
                  'max-w-[70%] space-y-1',
                  isOwnMessage ? 'items-end' : 'items-start'
                )}>
                  <div className={cn(
                    'px-4 py-2 rounded-2xl break-words',
                    isOwnMessage
                      ? 'bg-primary-blue text-primary-white rounded-br-md'
                      : 'bg-background-muted text-text-primary rounded-bl-md',
                    (message as OptimisticMessage).isPending && 'opacity-70'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs text-text-muted',
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  )}>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {isOwnMessage && message.readAt && (
                      <span className="text-primary-blue">✓</span>
                    )}
                    {isOwnMessage && (message as OptimisticMessage).isPending && (
                      <span className="text-text-muted">Sending...</span>
                    )}
                  </div>
                </div>

                {isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-accent-green text-primary-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {message.sender.avatar ? (
                      <img 
                        src={message.sender.avatar} 
                        alt={message.sender.name || 'You'} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      message.sender.name?.charAt(0).toUpperCase() || 'Y'
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background-secondary">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={cn(
                'w-full px-4 py-3 border border-border rounded-button',
                'bg-background-primary text-text-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue',
                'resize-none min-h-[48px] max-h-32',
                'transition-all duration-200'
              )}
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!newMessage.trim() || isSending}
            loading={isSending}
            className="px-6 self-end"
          >
            Send
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{newMessage.length}/2000</span>
        </div>
      </div>
    </div>
  );
}