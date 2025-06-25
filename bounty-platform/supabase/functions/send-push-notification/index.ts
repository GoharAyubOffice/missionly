// @ts-ignore: Deno/Edge import, not available in local TS
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore: Deno/Edge import, not available in local TS
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// @ts-ignore: Deno/Edge import, not available in local TS
import 'https://deno.land/x/xhr@0.3.0/mod.ts';

// Polyfill for atob/btoa in Deno Deploy and some Deno environments
if (typeof atob === 'undefined') {
  // @ts-ignore
  globalThis.atob = (input) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 === 1) throw new Error('Invalid base64 string');
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
        ? output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  };
}
if (typeof btoa === 'undefined') {
  // @ts-ignore
  globalThis.btoa = (input) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input;
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt(i += 3 / 4);
      if (charCode > 0xFF) throw new Error('btoa: The string to be encoded contains characters outside of the Latin1 range.');
      block = (block << 8) | charCode;
    }
    return output;
  };
}

// @ts-ignore: Deno global is available in Deno Deploy/Edge
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore: Deno global is available in Deno Deploy/Edge
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// @ts-ignore: Deno global is available in Deno Deploy/Edge
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
// @ts-ignore: Deno global is available in Deno Deploy/Edge
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
// @ts-ignore: Deno global is available in Deno Deploy/Edge
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!;

interface PushNotificationPayload {
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

interface SendNotificationRequest {
  userId: string;
  payload: PushNotificationPayload;
  type?: 'message' | 'bounty' | 'payment' | 'general';
}

// Helper function to convert base64url to Uint8Array
function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to generate JWT for VAPID
async function generateVapidJWT(): Promise<string> {
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };

  const payload = {
    aud: 'https://fcm.googleapis.com',
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import private key for signing
  const privateKeyBytes = base64UrlToUint8Array(VAPID_PRIVATE_KEY);
  const key = await crypto.subtle.importKey(
    'raw',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(unsignedToken)
  );

  const signatureArray = new Uint8Array(signature);
  const signatureB64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
}

// Function to send push notification
async function sendPushToEndpoint(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const jwt = await generateVapidJWT();
    
    const headers = new Headers({
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': payload.length.toString(),
      'TTL': '2419200', // 4 weeks
    });

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (response.ok || response.status === 410) {
      return { success: response.ok };
    } else {
      const errorText = await response.text();
      console.error('Push notification failed:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error: unknown) {
    console.error('Error sending push notification:', error);
    if (typeof error === 'object' && error && 'message' in error) {
      return { success: false, error: (error as any).message };
    }
    return { success: false, error: String(error) };
  }
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: SendNotificationRequest = await req.json();

    // Validate request
    if (!requestData.userId || !requestData.payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's push subscriptions from database
    const { data: subscriptions, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', requestData.userId);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push subscriptions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No push subscriptions found for user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title: requestData.payload.title,
      body: requestData.payload.body,
      icon: requestData.payload.icon || '/icon-192x192.png',
      badge: requestData.payload.badge || '/icon-72x72.png',
      tag: requestData.payload.tag || 'default',
      url: requestData.payload.url || '/',
      data: {
        timestamp: Date.now(),
        type: requestData.type || 'general',
        ...requestData.payload.data,
      },
      actions: requestData.payload.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: requestData.payload.requireInteraction || false,
      silent: requestData.payload.silent || false,
    };

    const payloadString = JSON.stringify(notificationPayload);

    // Send notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: { endpoint: string; p256dh: string; auth: string }) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const result = await sendPushToEndpoint(pushSubscription, payloadString);

        // If subscription is invalid (410), remove it from database
        if (!result.success && result.error?.includes('410')) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);
        }

        return result;
      })
    );

    const successful = results.filter(
      (result: PromiseSettledResult<{ success: boolean }>) => result.status === 'fulfilled' && result.value.success
    ).length;

    const total = results.length;

    // Log the notification send attempt
    await supabase
      .from('notification_logs')
      .insert({
        user_id: requestData.userId,
        type: requestData.type || 'general',
        title: requestData.payload.title,
        body: requestData.payload.body,
        successful_sends: successful,
        total_subscriptions: total,
        sent_at: new Date().toISOString(),
      })
      .single();

    return new Response(
      JSON.stringify({
        success: successful > 0,
        message: `Notification sent to ${successful}/${total} subscriptions`,
        details: {
          successful,
          total,
          type: requestData.type || 'general',
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Edge function error:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error && 'message' in error) {
      message = (error as any).message;
    } else if (typeof error === 'string') {
      message = error;
    }
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});