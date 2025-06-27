import { useState, useEffect, useCallback } from 'react';
import { clientConfig } from '@/config/client';

export interface PushNotificationPermission {
  state: NotificationPermission;
  supported: boolean;
  subscription: PushSubscription | null;
}

export interface UsePushNotificationsOptions {
  onPermissionGranted?: (subscription: PushSubscription) => void;
  onPermissionDenied?: () => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  onError?: (error: Error) => void;
  userContext?: {
    userId: string;
    messageThreads?: string[];
  };
}

export interface UsePushNotificationsReturn {
  permission: PushNotificationPermission;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  isSubscribed: boolean;
  error: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PushNotificationPermission>({
    state: 'default',
    supported: false,
    subscription: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onPermissionGranted,
    onPermissionDenied,
    onSubscriptionChange,
    onError,
    userContext
  } = options;

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const supported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
    
    setPermission(prev => ({
      ...prev,
      supported,
      state: supported ? Notification.permission : 'denied'
    }));

    return supported;
  }, []);

  // Get current subscription
  const getCurrentSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    if (!permission.supported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setPermission(prev => ({
        ...prev,
        subscription
      }));

      return subscription;
    } catch (err) {
      console.error('Error getting push subscription:', err);
      return null;
    }
  }, [permission.supported]);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!permission.supported) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service worker registered:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              // Optionally notify user about update
            }
          });
        }
      });

      return registration;
    } catch (err) {
      console.error('Service worker registration failed:', err);
      throw new Error('Failed to register service worker');
    }
  }, [permission.supported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!permission.supported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First register service worker
      await registerServiceWorker();

      // Request permission
      const result = await Notification.requestPermission();
      
      setPermission(prev => ({
        ...prev,
        state: result
      }));

      if (result === 'granted') {
        onPermissionGranted && await subscribe().then(sub => {
          if (sub) onPermissionGranted(sub);
        });
        return true;
      } else {
        onPermissionDenied && onPermissionDenied();
        setError('Permission denied for push notifications');
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error requesting permission:', error);
      setError(error.message);
      onError && onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [permission.supported, onPermissionGranted, onPermissionDenied, onError, registerServiceWorker]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!permission.supported || permission.state !== 'granted') {
      throw new Error('Permission not granted for push notifications');
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        if (!clientConfig.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
          throw new Error('VAPID public key is not set');
        }
        const applicationServerKey = urlBase64ToUint8Array(clientConfig.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
        
        console.log('Push subscription created:', subscription);
      }

      setPermission(prev => ({
        ...prev,
        subscription
      }));

      onSubscriptionChange && onSubscriptionChange(subscription);

      // Save subscription to server (we'll implement this in the user actions)
      if (subscription && userContext?.userId) {
        try {
          const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription: subscription.toJSON(),
              userId: userContext.userId,
              threadIds: userContext.messageThreads || []
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save subscription to server');
          }
        } catch (serverError) {
          console.error('Error saving subscription to server:', serverError);
          // Don't throw here - the local subscription is still valid
        }
      }

      return subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe to push notifications');
      console.error('Error subscribing to push notifications:', error);
      setError(error.message);
      onError && onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permission.supported, permission.state, clientConfig.NEXT_PUBLIC_VAPID_PUBLIC_KEY, onSubscriptionChange, onError, userContext]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!permission.subscription) {
      return true; // Already unsubscribed
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await permission.subscription.unsubscribe();
      
      if (success) {
        setPermission(prev => ({
          ...prev,
          subscription: null
        }));

        onSubscriptionChange && onSubscriptionChange(null);

        // Remove subscription from server
        if (userContext?.userId) {
          try {
            await fetch('/api/push/unsubscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userContext.userId
              }),
            });
          } catch (serverError) {
            console.error('Error removing subscription from server:', serverError);
            // Don't throw here - the local unsubscription was successful
          }
        }
      }

      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe from push notifications');
      console.error('Error unsubscribing from push notifications:', error);
      setError(error.message);
      onError && onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [permission.subscription, onSubscriptionChange, onError, userContext]);

  // Initialize on mount
  useEffect(() => {
    checkSupport();
    
    if (permission.supported) {
      getCurrentSubscription();
    }
  }, [checkSupport, getCurrentSubscription, permission.supported]);

  // Listen for permission changes
  useEffect(() => {
    if (!permission.supported) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check permission when page becomes visible
        setPermission(prev => ({
          ...prev,
          state: Notification.permission
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [permission.supported]);

  return {
    permission,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!permission.subscription,
    error,
  };
}