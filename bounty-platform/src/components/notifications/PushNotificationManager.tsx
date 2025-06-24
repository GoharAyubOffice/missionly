'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePushNotifications, type UsePushNotificationsReturn } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PushNotificationContextType extends UsePushNotificationsReturn {
  showPermissionPrompt: (context?: string) => void;
  hidePermissionPrompt: () => void;
}

const PushNotificationContext = createContext<PushNotificationContextType | null>(null);

export function usePushNotificationContext() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider');
  }
  return context;
}

interface PushNotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
  messageThreadIds?: string[];
}

export function PushNotificationProvider({ 
  children, 
  userId,
  messageThreadIds = []
}: PushNotificationProviderProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptContext, setPromptContext] = useState<string>('');

  const pushNotifications = usePushNotifications({
    userContext: userId ? {
      userId,
      messageThreads: messageThreadIds
    } : undefined,
    onPermissionGranted: (subscription) => {
      console.log('Push notifications enabled:', subscription);
      setShowPrompt(false);
    },
    onPermissionDenied: () => {
      console.log('Push notifications denied');
      setShowPrompt(false);
    },
    onError: (error) => {
      console.error('Push notification error:', error);
    }
  });

  const showPermissionPrompt = (context = '') => {
    if (pushNotifications.permission.state === 'default' && pushNotifications.permission.supported) {
      setPromptContext(context);
      setShowPrompt(true);
    }
  };

  const hidePermissionPrompt = () => {
    setShowPrompt(false);
    setPromptContext('');
  };

  const contextValue: PushNotificationContextType = {
    ...pushNotifications,
    showPermissionPrompt,
    hidePermissionPrompt,
  };

  return (
    <PushNotificationContext.Provider value={contextValue}>
      {children}
      {showPrompt && (
        <PushNotificationPrompt 
          context={promptContext}
          onEnable={() => pushNotifications.requestPermission()}
          onDismiss={hidePermissionPrompt}
          isLoading={pushNotifications.isLoading}
        />
      )}
    </PushNotificationContext.Provider>
  );
}

interface PushNotificationPromptProps {
  context?: string;
  onEnable: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

function PushNotificationPrompt({ 
  context, 
  onEnable, 
  onDismiss, 
  isLoading 
}: PushNotificationPromptProps) {
  const getPromptContent = () => {
    switch (context) {
      case 'message':
        return {
          title: 'Stay updated on your conversations',
          description: 'Get notified when you receive new messages, even when the app is closed.',
          benefits: ['Never miss important messages', 'Respond faster to clients and freelancers', 'Stay on top of project updates']
        };
      case 'bounty':
        return {
          title: 'Get notified about bounty updates',
          description: 'Receive instant notifications when someone applies to your bounties or when bounty status changes.',
          benefits: ['Know immediately when freelancers apply', 'Track bounty progress in real-time', 'Never miss payment notifications']
        };
      default:
        return {
          title: 'Enable push notifications',
          description: 'Stay updated with important platform activities and never miss critical updates.',
          benefits: ['Real-time updates', 'Better communication', 'Enhanced productivity']
        };
    }
  };

  const content = getPromptContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background-primary rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-primary-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-5 5v-5zM12 8v8m0 0l-3-3m3 3l3-3M3 12a9 9 0 1118 0 9 9 0 01-18 0z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {content.title}
          </h3>
          <p className="text-text-secondary text-sm">
            {content.description}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-text-primary mb-3 text-sm">
            Benefits:
          </h4>
          <ul className="space-y-2">
            {content.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-text-secondary">
                <svg 
                  className="w-4 h-4 text-accent-green mr-2 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onDismiss}
            disabled={isLoading}
          >
            Not Now
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onEnable}
            loading={isLoading}
          >
            Enable Notifications
          </Button>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          You can change this setting anytime in your browser preferences.
        </p>
      </div>
    </div>
  );
}

interface NotificationStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function NotificationStatus({ className, showDetails = false }: NotificationStatusProps) {
  const { permission, isSubscribed, requestPermission, isLoading } = usePushNotificationContext();

  if (!permission.supported) {
    return showDetails ? (
      <div className={cn("text-sm text-text-muted", className)}>
        Push notifications are not supported in this browser
      </div>
    ) : null;
  }

  const getStatusInfo = () => {
    if (permission.state === 'granted' && isSubscribed) {
      return {
        status: 'Enabled',
        color: 'text-accent-green',
        icon: '✓'
      };
    } else if (permission.state === 'denied') {
      return {
        status: 'Blocked',
        color: 'text-error',
        icon: '✗'
      };
    } else {
      return {
        status: 'Disabled',
        color: 'text-text-muted',
        icon: '○'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={statusInfo.color}>{statusInfo.icon}</span>
      <span className="text-sm">
        Notifications: {statusInfo.status}
      </span>
      {showDetails && permission.state === 'default' && (
        <Button
          variant="text"
          size="sm"
          onClick={requestPermission}
          loading={isLoading}
        >
          Enable
        </Button>
      )}
    </div>
  );
}

// Hook for triggering context-aware permission requests
export function useContextualNotificationPrompt() {
  const { showPermissionPrompt, permission } = usePushNotificationContext();

  const promptForMessages = () => {
    if (permission.state === 'default') {
      showPermissionPrompt('message');
    }
  };

  const promptForBounties = () => {
    if (permission.state === 'default') {
      showPermissionPrompt('bounty');
    }
  };

  return {
    promptForMessages,
    promptForBounties,
    isSupported: permission.supported,
    currentState: permission.state,
  };
}