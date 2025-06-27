// Analytics and monitoring utilities

import { clientConfig } from '@/config/client';

// Vercel Analytics (built-in)
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', { event, ...properties });
    }
  },
  
  page: (url?: string) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('page', url);
    }
  },
};

// Custom event tracking for business metrics
export const trackBusinessEvent = (
  event: 'bounty_created' | 'bounty_applied' | 'bounty_completed' | 'message_sent' | 'payment_completed',
  properties?: Record<string, any>
) => {
  // Track with Vercel Analytics
  analytics.track(event, properties);
  
  // Track with custom analytics if needed
  if (typeof window !== 'undefined') {
    // Custom tracking implementation
    console.log('Business Event:', event, properties);
  }
};

// Performance monitoring
export const trackPerformance = (metricName: string, value: number, tags?: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    // Send to Vercel Analytics
    analytics.track('performance_metric', {
      metric: metricName,
      value,
      ...tags,
    });
    
    // Send to browser performance API
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.mark(`${metricName}-start`);
        performance.measure(metricName, `${metricName}-start`);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }
};

// Error tracking (complements Sentry)
export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('Tracked Error:', error, context);
  
  // Send to analytics
  analytics.track('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
  
  // Sentry will automatically capture this if configured
};

// User behavior tracking
export const trackUserAction = (
  action: 'click' | 'view' | 'form_submit' | 'search' | 'filter',
  element: string,
  properties?: Record<string, any>
) => {
  analytics.track('user_action', {
    action,
    element,
    timestamp: Date.now(),
    ...properties,
  });
};

// Feature usage tracking
export const trackFeatureUsage = (
  feature: 'push_notifications' | 'real_time_messaging' | 'payment_processing' | 'file_upload',
  usage: 'enabled' | 'disabled' | 'used' | 'error',
  properties?: Record<string, any>
) => {
  analytics.track('feature_usage', {
    feature,
    usage,
    ...properties,
  });
};

// Conversion funnel tracking
export const trackConversion = (
  step: 'landing' | 'registration' | 'profile_completion' | 'first_bounty' | 'first_application' | 'first_payment',
  properties?: Record<string, any>
) => {
  analytics.track('conversion_step', {
    step,
    timestamp: Date.now(),
    ...properties,
  });
};

// Web Vitals tracking
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}) => {
  analytics.track('web_vital', {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_id: metric.id,
    metric_delta: metric.delta,
  });
  
  // Send to Sentry for performance monitoring
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: metric,
    });
  }
};

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize Web Vitals tracking
  import('web-vitals').then((webVitals) => {
    webVitals.onCLS?.(trackWebVitals);
    webVitals.onFCP?.(trackWebVitals);
    webVitals.onLCP?.(trackWebVitals);
    webVitals.onTTFB?.(trackWebVitals);
    webVitals.onINP?.(trackWebVitals);
  });
  
  // Track initial page view
  analytics.page();
  
  // Track basic environment info
  analytics.track('session_start', {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  });
};

// Declare global types for TypeScript
declare global {
  interface Window {
    va?: (event: string, data?: any) => void;
    Sentry?: any;
  }
}