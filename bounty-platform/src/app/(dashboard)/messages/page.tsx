import { redirect } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessageThreads } from '@/app/actions/messages';
import { cn } from '@/lib/utils';

export default async function MessagesPage() {
  // Get current user
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Get message threads
  const threadsResult = await getMessageThreads();
  
  if (!threadsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Messages</h1>
          <p className="text-error">{threadsResult.error}</p>
        </div>
      </div>
    );
  }

  const threads = threadsResult.threads || [];

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Messages</h1>
        <p className="text-text-secondary">
          Communicate with clients and freelancers about your bounty projects
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.091-4.091l-1.419-2.838a1 1 0 010-.894L5.91 8.09A8.001 8.001 0 0113 4c4.418 0 8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No messages yet</h3>
          <p className="text-text-secondary mb-6">
            Start a conversation by working on a bounty project
          </p>
          <Link 
            href="/bounties"
            className="inline-flex items-center px-6 py-3 bg-primary-blue text-primary-white rounded-button hover:bg-primary-blue/90 transition-colors"
          >
            Browse Bounties
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => {
            const otherUser = thread.client.id === user.id ? thread.freelancer : thread.client;
            const lastMessage = thread.lastMessage;
            
            return (
              <Link key={thread.id} href={`/messages/${thread.id}`}>
                <div className={cn(
                  'p-4 border border-border rounded-lg bg-background-primary',
                  'hover:bg-background-secondary transition-colors',
                  'cursor-pointer group'
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-blue text-primary-white flex items-center justify-center font-medium flex-shrink-0">
                        {otherUser.avatar ? (
                          <img 
                            src={otherUser.avatar} 
                            alt={otherUser.name || 'User'} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          otherUser.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary truncate">
                            {otherUser.name || 'Anonymous User'}
                          </h3>
                          <div className={cn(
                            'px-2 py-0.5 rounded-full text-xs',
                            thread.bounty.status === 'OPEN' && 'bg-accent-green/10 text-accent-green',
                            thread.bounty.status === 'IN_PROGRESS' && 'bg-primary-blue/10 text-primary-blue',
                            thread.bounty.status === 'COMPLETED' && 'bg-success/10 text-success',
                            thread.bounty.status === 'CANCELLED' && 'bg-error/10 text-error'
                          )}>
                            {thread.bounty.status.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-2 line-clamp-1">
                          {thread.bounty.title}
                        </p>

                        {lastMessage && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted">
                              {lastMessage.sender.name === otherUser.name ? '' : 'You: '}
                            </span>
                            <p className="text-sm text-text-secondary line-clamp-1 flex-1">
                              {lastMessage.type === 'SYSTEM' ? (
                                <em>{lastMessage.content}</em>
                              ) : (
                                lastMessage.content
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - time and unread indicator */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-text-muted">
                        {formatLastMessageTime(thread.lastMessageAt)}
                      </span>
                      
                      {thread.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary-blue text-primary-white rounded-full flex items-center justify-center text-xs font-medium">
                          {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Messages - Bounty Platform',
  description: 'View and manage your message conversations',
};