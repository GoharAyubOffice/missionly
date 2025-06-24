import { renderHook, act } from '@testing-library/react';
import { usePushNotifications } from '../usePushNotifications';

// Mock fetch
global.fetch = jest.fn();

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset permissions
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      value: 'default',
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission.supported).toBe(true);
    expect(result.current.permission.state).toBe('default');
    expect(result.current.permission.subscription).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should detect unsupported browsers', () => {
    // Mock unsupported environment
    delete (global as any).Notification;
    delete (navigator as any).serviceWorker;
    delete (global as any).PushManager;

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission.supported).toBe(false);
    expect(result.current.permission.state).toBe('denied');

    // Restore
    (global as any).Notification = class Notification {};
    (navigator as any).serviceWorker = {
      register: jest.fn(),
      ready: Promise.resolve({}),
    };
    (global as any).PushManager = class PushManager {};
  });

  it('should request permission successfully', async () => {
    Notification.requestPermission = jest.fn().mockResolvedValue('granted');
    navigator.serviceWorker.register = jest.fn().mockResolvedValue({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(null),
        subscribe: jest.fn().mockResolvedValue({
          endpoint: 'https://example.com/push',
          keys: {
            p256dh: 'test-p256dh',
            auth: 'test-auth',
          },
          toJSON: () => ({
            endpoint: 'https://example.com/push',
            keys: {
              p256dh: 'test-p256dh',
              auth: 'test-auth',
            },
          }),
        }),
      },
    });
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() =>
      usePushNotifications({
        userContext: { userId: 'test-user' },
      })
    );

    await act(async () => {
      const success = await result.current.requestPermission();
      expect(success).toBe(true);
    });

    expect(Notification.requestPermission).toHaveBeenCalled();
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
    });
  });

  it('should handle permission denial', async () => {
    Notification.requestPermission = jest.fn().mockResolvedValue('denied');
    navigator.serviceWorker.register = jest.fn().mockResolvedValue({});

    const onPermissionDenied = jest.fn();
    const { result } = renderHook(() =>
      usePushNotifications({
        onPermissionDenied,
      })
    );

    await act(async () => {
      const success = await result.current.requestPermission();
      expect(success).toBe(false);
    });

    expect(onPermissionDenied).toHaveBeenCalled();
    expect(result.current.error).toBe('Permission denied for push notifications');
  });

  it('should handle subscription errors', async () => {
    Notification.requestPermission = jest.fn().mockResolvedValue('granted');
    navigator.serviceWorker.register = jest.fn().mockResolvedValue({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(null),
        subscribe: jest.fn().mockRejectedValue(new Error('Subscription failed')),
      },
    });

    const onError = jest.fn();
    const { result } = renderHook(() =>
      usePushNotifications({
        onError,
      })
    );

    await act(async () => {
      const subscription = await result.current.subscribe();
      expect(subscription).toBe(null);
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(result.current.error).toContain('Subscription failed');
  });

  it('should unsubscribe successfully', async () => {
    const mockSubscription = {
      unsubscribe: jest.fn().mockResolvedValue(true),
      endpoint: 'https://example.com/push',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const onSubscriptionChange = jest.fn();
    const { result } = renderHook(() =>
      usePushNotifications({
        onSubscriptionChange,
        userContext: { userId: 'test-user' },
      })
    );

    // Manually set subscription
    act(() => {
      result.current.permission.subscription = mockSubscription as any;
    });

    await act(async () => {
      const success = await result.current.unsubscribe();
      expect(success).toBe(true);
    });

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(onSubscriptionChange).toHaveBeenCalledWith(null);
    expect(fetch).toHaveBeenCalledWith('/api/push/unsubscribe', expect.any(Object));
  });
});