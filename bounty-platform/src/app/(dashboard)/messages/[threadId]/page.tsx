import { redirect } from 'next/navigation';
import { MessageThread } from '@/components/messages/MessageThread';
import { getMessages } from '@/app/actions/messages';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface MessageThreadPageProps {
  params: {
    threadId: string;
  };
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { threadId } = params;

  // Get current user
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // Get thread details
  const messageThread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      bounty: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      freelancer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!messageThread) {
    redirect('/messages');
  }

  // Verify user has access to this thread
  const hasAccess = 
    messageThread.clientId === currentUser.id || 
    messageThread.freelancerId === currentUser.id;

  if (!hasAccess) {
    redirect('/messages');
  }

  // Get messages
  const messagesResult = await getMessages(threadId);
  
  if (!messagesResult.success) {
    redirect('/messages');
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <MessageThread
        threadId={threadId}
        initialMessages={messagesResult.messages || []}
        currentUserId={currentUser.id}
        bounty={{
          id: messageThread.bounty.id,
          title: messageThread.bounty.title,
          client: messageThread.client,
          freelancer: messageThread.freelancer,
        }}
        className="flex-1"
      />
    </div>
  );
}

export async function generateMetadata({ params }: MessageThreadPageProps) {
  const { threadId } = params;

  // Get thread details for metadata
  const messageThread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      bounty: {
        select: {
          title: true,
        },
      },
    },
  });

  return {
    title: messageThread?.bounty.title 
      ? `Messages - ${messageThread.bounty.title}` 
      : 'Messages',
    description: 'View and send messages for this bounty project.',
  };
}