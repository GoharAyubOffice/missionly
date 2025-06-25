'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';
import { type BusinessProfileData } from '@/components/forms/BusinessProfileForm';
import { type MarketerProfileData } from '@/components/forms/MarketerProfileForm';
import webpush from 'web-push';
import { getServerConfig } from '@/config';

const prisma = new PrismaClient();

// Configure web-push with VAPID keys (lazy initialization)
const config = getServerConfig();

function initializeWebPush() {
  if (config.VAPID_SUBJECT && config.NEXT_PUBLIC_VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      config.VAPID_SUBJECT,
      config.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      config.VAPID_PRIVATE_KEY
    );
    return true;
  }
  return false;
}

export async function updateBusinessProfile(data: BusinessProfileData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to update your profile.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    if (dbUser.role !== 'CLIENT') {
      return {
        success: false,
        error: 'This profile type is not valid for your account.',
      };
    }

    // Update user profile
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: data.companyName,
        bio: data.companyDescription,
        avatar: data.avatar,
        website: data.website,
        location: data.location,
        skills: data.projectTypes,
        status: 'ACTIVE', // Mark profile as complete
      },
    });

    // Store additional business-specific data in a separate table if needed
    // For now, we'll use the bio field for company description and skills for project types

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return {
      success: true,
      message: 'Business profile updated successfully.',
    };
  } catch (error) {
    console.error('Business profile update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}

export async function updateMarketerProfile(data: MarketerProfileData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to update your profile.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    if (dbUser.role !== 'FREELANCER') {
      return {
        success: false,
        error: 'This profile type is not valid for your account.',
      };
    }

    // Update user profile
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        bio: data.bio,
        avatar: data.avatar,
        website: data.portfolio,
        location: data.location,
        skills: data.skills,
        status: 'ACTIVE', // Mark profile as complete
      },
    });

    // Store additional marketer-specific data
    // For now, we'll use existing fields creatively
    // In a production app, you might want a separate profile table

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return {
      success: true,
      message: 'Marketer profile updated successfully.',
    };
  } catch (error) {
    console.error('Marketer profile update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}

export async function autoSaveProfile(data: Partial<BusinessProfileData | MarketerProfileData>) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    // Determine what fields to update based on the data structure
    const updateData: any = {};

    if ('companyName' in data && data.companyName) {
      updateData.name = data.companyName;
    }
    
    if ('companyDescription' in data && data.companyDescription) {
      updateData.bio = data.companyDescription;
    }
    
    if ('bio' in data && data.bio) {
      updateData.bio = data.bio;
    }
    
    if ('avatar' in data && data.avatar) {
      updateData.avatar = data.avatar;
    }
    
    if ('website' in data && data.website) {
      updateData.website = data.website;
    }
    
    if ('portfolio' in data && data.portfolio) {
      updateData.website = data.portfolio;
    }
    
    if ('location' in data && data.location) {
      updateData.location = data.location;
    }
    
    if ('skills' in data && data.skills && data.skills.length > 0) {
      updateData.skills = data.skills;
    }
    
    if ('projectTypes' in data && data.projectTypes && data.projectTypes.length > 0) {
      updateData.skills = data.projectTypes;
    }

    // Only update if there's actual data to save
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
      });
    }

    return {
      success: true,
      message: 'Profile auto-saved.',
    };
  } catch (error) {
    console.error('Auto-save error:', error);
    return {
      success: false,
      error: 'Auto-save failed.',
    };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        skills: true,
        role: true,
        status: true,
        reputation: true,
        totalEarned: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    return {
      success: true,
      user: dbUser,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
    };
  }
}

export async function checkProfileCompletion() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        role: true,
        status: true,
        bio: true,
        location: true,
        skills: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    // Check if profile is complete based on role
    let isComplete = false;
    
    if (dbUser.status === 'ACTIVE') {
      isComplete = true;
    } else {
      // Basic completion check
      isComplete = !!(
        dbUser.bio &&
        dbUser.location &&
        dbUser.skills &&
        dbUser.skills.length > 0
      );
    }

    return {
      success: true,
      isComplete,
      role: dbUser.role,
      status: dbUser.status,
    };
  } catch (error) {
    console.error('Profile completion check error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
    };
  }
}

// Push Notification Functions

export interface PushSubscriptionData {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userId: string;
  threadIds?: string[];
}

export async function subscribeToPushNotifications(data: PushSubscriptionData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to subscribe to notifications.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: data.subscription.endpoint },
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: data.subscription.endpoint },
        data: {
          userId: dbUser.id,
          p256dh: data.subscription.keys.p256dh,
          auth: data.subscription.keys.auth,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: dbUser.id,
          endpoint: data.subscription.endpoint,
          p256dh: data.subscription.keys.p256dh,
          auth: data.subscription.keys.auth,
        },
      });
    }

    return {
      success: true,
      message: 'Successfully subscribed to push notifications.',
    };
  } catch (error) {
    console.error('Push subscription error:', error);
    return {
      success: false,
      error: 'Failed to subscribe to push notifications.',
    };
  }
}

export async function unsubscribeFromPushNotifications(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser || dbUser.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized or user not found.',
      };
    }

    // Remove all push subscriptions for this user
    await prisma.pushSubscription.deleteMany({
      where: { userId: dbUser.id },
    });

    return {
      success: true,
      message: 'Successfully unsubscribed from push notifications.',
    };
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return {
      success: false,
      error: 'Failed to unsubscribe from push notifications.',
    };
  }
}

export interface SendPushNotificationData {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export async function sendPushNotification(data: SendPushNotificationData) {
  try {
    // Check if web push is configured
    if (!initializeWebPush()) {
      console.warn('Web push not configured, skipping notification');
      return {
        success: false,
        error: 'Web push notifications not configured',
      };
    }

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: data.userId },
    });

    if (subscriptions.length === 0) {
      return {
        success: false,
        error: 'No push subscriptions found for user.',
      };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-72x72.png',
      tag: data.tag || 'default',
      url: data.url || '/',
      data: {
        timestamp: Date.now(),
        ...data.data,
      },
      actions: data.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          const result = await webpush.sendNotification(pushSubscription, payload);
          return { success: true, result };
        } catch (error) {
          console.error('Failed to send notification to subscription:', subscription.endpoint, error);
          
          // If the subscription is invalid, remove it
          if (error instanceof Error && 
              (error.message.includes('410') || error.message.includes('expired'))) {
            await prisma.pushSubscription.delete({
              where: { endpoint: subscription.endpoint },
            }).catch(deleteError => {
              console.error('Failed to delete invalid subscription:', deleteError);
            });
          }
          
          return { success: false, error };
        }
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const total = results.length;

    return {
      success: successful > 0,
      message: `Notification sent to ${successful}/${total} subscriptions.`,
      results: {
        successful,
        total,
        details: results,
      },
    };
  } catch (error) {
    console.error('Send push notification error:', error);
    return {
      success: false,
      error: 'Failed to send push notification.',
    };
  }
}

export async function sendMessageNotification(threadId: string, senderId: string, messageContent: string) {
  try {
    // Get the message thread and participants
    const messageThread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        bounty: {
          select: {
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!messageThread) {
      return {
        success: false,
        error: 'Message thread not found.',
      };
    }

    // Determine recipient (the person who didn't send the message)
    const recipientId = senderId === messageThread.clientId 
      ? messageThread.freelancerId 
      : messageThread.clientId;

    const sender = senderId === messageThread.clientId 
      ? messageThread.client 
      : messageThread.freelancer;

    const senderName = sender.name || 'Someone';
    
    // Truncate message for notification
    const truncatedMessage = messageContent.length > 100 
      ? messageContent.substring(0, 100) + '...' 
      : messageContent;

    const notificationData: SendPushNotificationData = {
      userId: recipientId,
      title: `New message in ${messageThread.bounty.title}`,
      body: `${senderName}: ${truncatedMessage}`,
      icon: '/icon-192x192.png',
      tag: `message-${threadId}`,
      url: `/messages/${threadId}`,
      data: {
        type: 'message',
        threadId,
        senderId,
        messageContent,
      },
      actions: [
        { action: 'view', title: 'View Message' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: false,
    };

    return await sendPushNotification(notificationData);
  } catch (error) {
    console.error('Send message notification error:', error);
    return {
      success: false,
      error: 'Failed to send message notification.',
    };
  }
}

export async function getUserPushSubscriptions(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser || dbUser.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized or user not found.',
      };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      subscriptions,
    };
  } catch (error) {
    console.error('Get push subscriptions error:', error);
    return {
      success: false,
      error: 'Failed to get push subscriptions.',
    };
  }
}