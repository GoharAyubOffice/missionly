'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface CreateMessageThreadResult {
  success: boolean;
  threadId?: string;
  error?: string;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface GetMessagesResult {
  success: boolean;
  messages?: Array<{
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
  }>;
  error?: string;
}

// Create or get existing message thread for a bounty
export async function createMessageThread(bountyId: string): Promise<CreateMessageThreadResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a message thread.',
      };
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get bounty with client and assignee
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      include: {
        client: true,
        assignee: true,
      },
    });

    if (!bounty) {
      return {
        success: false,
        error: 'Bounty not found.',
      };
    }

    // Verify user is involved in the bounty (either client or assignee)
    const isClient = bounty.clientId === currentUser.id;
    const isAssignee = bounty.assigneeId === currentUser.id;

    if (!isClient && !isAssignee) {
      return {
        success: false,
        error: 'You can only create message threads for bounties you are involved in.',
      };
    }

    // For messaging, we need both client and freelancer
    if (!bounty.assigneeId) {
      return {
        success: false,
        error: 'Cannot create message thread until a freelancer is assigned to this bounty.',
      };
    }

    // Check if thread already exists
    const existingThread = await prisma.messageThread.findUnique({
      where: {
        bountyId_clientId_freelancerId: {
          bountyId: bounty.id,
          clientId: bounty.clientId,
          freelancerId: bounty.assigneeId,
        },
      },
    });

    if (existingThread) {
      return {
        success: true,
        threadId: existingThread.id,
      };
    }

    // Create new message thread
    const messageThread = await prisma.messageThread.create({
      data: {
        bountyId: bounty.id,
        clientId: bounty.clientId,
        freelancerId: bounty.assigneeId,
      },
    });

    // Create system message to initialize the thread
    await prisma.message.create({
      data: {
        threadId: messageThread.id,
        senderId: currentUser.id,
        content: `Message thread created for bounty: ${bounty.title}`,
        type: 'SYSTEM',
      },
    });

    revalidatePath(`/bounties/${bountyId}`);

    return {
      success: true,
      threadId: messageThread.id,
    };
  } catch (error) {
    console.error('Create message thread error:', error);
    return {
      success: false,
      error: 'Failed to create message thread.',
    };
  }
}

// Send a message in a thread
export async function sendMessage(
  threadId: string,
  content: string,
  type: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT'
): Promise<SendMessageResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to send messages.',
      };
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get message thread and verify user access
    const messageThread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        bounty: true,
      },
    });

    if (!messageThread) {
      return {
        success: false,
        error: 'Message thread not found.',
      };
    }

    // Verify user is part of this thread
    const isParticipant = 
      messageThread.clientId === currentUser.id || 
      messageThread.freelancerId === currentUser.id;

    if (!isParticipant) {
      return {
        success: false,
        error: 'You can only send messages in threads you are part of.',
      };
    }

    // Validate message content
    if (!content.trim()) {
      return {
        success: false,
        error: 'Message content cannot be empty.',
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: 'Message content cannot exceed 2000 characters.',
      };
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        threadId: messageThread.id,
        senderId: currentUser.id,
        content: content.trim(),
        type,
      },
    });

    // Update thread's lastMessageAt
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    revalidatePath(`/messages/${threadId}`);
    revalidatePath(`/bounties/${messageThread.bountyId}`);

    return {
      success: true,
      messageId: message.id,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      error: 'Failed to send message.',
    };
  }
}

// Get messages for a thread
export async function getMessages(threadId: string): Promise<GetMessagesResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view messages.',
      };
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get message thread and verify user access
    const messageThread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!messageThread) {
      return {
        success: false,
        error: 'Message thread not found.',
      };
    }

    // Verify user is part of this thread
    const isParticipant = 
      messageThread.clientId === currentUser.id || 
      messageThread.freelancerId === currentUser.id;

    if (!isParticipant) {
      return {
        success: false,
        error: 'You can only view messages in threads you are part of.',
      };
    }

    // Get messages with sender information
    const messages = await prisma.message.findMany({
      where: { threadId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      messages: messages.map(message => ({
        id: message.id,
        content: message.content,
        type: message.type,
        readAt: message.readAt?.toISOString() || null,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      })),
    };
  } catch (error) {
    console.error('Get messages error:', error);
    return {
      success: false,
      error: 'Failed to get messages.',
    };
  }
}

// Mark messages as read
export async function markMessagesAsRead(threadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to mark messages as read.',
      };
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get message thread and verify user access
    const messageThread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!messageThread) {
      return {
        success: false,
        error: 'Message thread not found.',
      };
    }

    // Verify user is part of this thread
    const isParticipant = 
      messageThread.clientId === currentUser.id || 
      messageThread.freelancerId === currentUser.id;

    if (!isParticipant) {
      return {
        success: false,
        error: 'You can only mark messages as read in threads you are part of.',
      };
    }

    // Mark all unread messages from other users as read
    await prisma.message.updateMany({
      where: {
        threadId,
        senderId: { not: currentUser.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath(`/messages/${threadId}`);

    return { success: true };
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return {
      success: false,
      error: 'Failed to mark messages as read.',
    };
  }
}

// Get message threads for current user
export async function getMessageThreads() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view message threads.',
      };
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get threads where user is either client or freelancer
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [
          { clientId: currentUser.id },
          { freelancerId: currentUser.id },
        ],
      },
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
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            type: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: currentUser.id },
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return {
      success: true,
      threads: threads.map(thread => ({
        id: thread.id,
        bounty: thread.bounty,
        client: thread.client,
        freelancer: thread.freelancer,
        lastMessage: thread.messages[0] || null,
        unreadCount: thread._count.messages,
        lastMessageAt: thread.lastMessageAt.toISOString(),
        createdAt: thread.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get message threads error:', error);
    return {
      success: false,
      error: 'Failed to get message threads.',
    };
  }
}