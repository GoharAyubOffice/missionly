# Push Notifications Implementation Guide

## Overview

This implementation provides a complete Web Push notification system with:

- ✅ **Frontend Components**: Service Worker and React hooks for managing push notifications
- ✅ **Backend Actions**: Server actions for subscription management and notification sending
- ✅ **Supabase Edge Function**: Serverless function for sending push notifications
- ✅ **Database Triggers**: Automatic notifications for messages, bounty updates, and applications
- ✅ **Context-Aware Prompts**: Smart permission requests at logical moments

## Setup Instructions

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Web Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@domain.com"
```

To generate VAPID keys:
```bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
```

### 2. Database Setup

Run the migrations to set up the database:

```bash
# Apply messaging realtime setup
npx supabase db push --file supabase/migrations/20250624000001_enable_realtime_messaging.sql

# Apply push notification setup
npx supabase db push --file supabase/migrations/20250624000002_setup_push_notifications.sql
```

### 3. Deploy Supabase Edge Function

```bash
# Login to Supabase CLI
npx supabase login

# Deploy the edge function
npx supabase functions deploy send-push-notification

# Set environment variables for the edge function
npx supabase secrets set VAPID_PUBLIC_KEY="your-vapid-public-key"
npx supabase secrets set VAPID_PRIVATE_KEY="your-vapid-private-key" 
npx supabase secrets set VAPID_SUBJECT="mailto:your-email@domain.com"
```

### 4. Configure Supabase Settings

In your Supabase dashboard, add these settings:

```sql
-- Set Supabase URL and service role key for the edge function
SELECT set_config('app.supabase_url', 'your-project-ref.supabase.co', false);
SELECT set_config('app.service_role_key', 'your-service-role-key', false);
```

## Implementation Details

### Frontend Architecture

#### Service Worker (`/public/sw.js`)
- Handles push notification events
- Manages notification clicks and actions
- Implements basic caching strategy
- Deep-links to relevant content

#### React Hook (`/src/hooks/usePushNotifications.ts`)
- Manages permission states
- Handles subscription lifecycle
- Provides error handling
- Integrates with backend APIs

#### Notification Manager (`/src/components/notifications/PushNotificationManager.tsx`)
- Context-aware permission prompts
- Smart timing for permission requests
- Visual status indicators
- Provider pattern for app-wide access

### Backend Architecture

#### Server Actions (`/src/app/actions/user.ts`)
- `subscribeToPushNotifications()` - Save user subscriptions
- `unsubscribeFromPushNotifications()` - Remove subscriptions
- `sendPushNotification()` - Send notifications via web-push
- `sendMessageNotification()` - Specialized message notifications

#### API Routes
- `POST /api/push/subscribe` - Handle subscription requests
- `POST /api/push/unsubscribe` - Handle unsubscription

#### Edge Function (`/supabase/functions/send-push-notification/index.ts`)
- Serverless notification sending
- VAPID JWT generation
- Subscription validation
- Error handling and cleanup

### Database Triggers

Automatic notifications are sent for:

1. **New Messages**: When someone sends a message in a thread
2. **Bounty Applications**: When a freelancer applies to a bounty
3. **Bounty Status Changes**: When bounties are assigned or completed

## Usage Examples

### Basic Setup in a Component

```tsx
import { PushNotificationProvider } from '@/components/notifications/PushNotificationManager';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  return (
    <PushNotificationProvider 
      userId={currentUser?.id}
      messageThreadIds={currentUser?.activeThreads}
    >
      <YourAppContent />
    </PushNotificationProvider>
  );
}
```

### Context-Aware Permission Requests

```tsx
import { useContextualNotificationPrompt } from '@/components/notifications/PushNotificationManager';

function MessageThread() {
  const { promptForMessages } = useContextualNotificationPrompt();
  
  // Automatically prompt when user engages with messages
  useEffect(() => {
    const timer = setTimeout(() => {
      promptForMessages(); // Smart prompt after user engagement
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
}
```

### Manual Notification Sending

```tsx
import { sendPushNotification } from '@/app/actions/user';

async function sendCustomNotification() {
  const result = await sendPushNotification({
    userId: 'user-id',
    title: 'Custom Notification',
    body: 'This is a custom message',
    url: '/custom-page',
    data: { customData: 'value' }
  });
  
  if (result.success) {
    console.log('Notification sent successfully');
  }
}
```

## Notification Types

### Message Notifications
- **Trigger**: New message in thread
- **Recipients**: Thread participants (excluding sender)
- **Content**: Sender name + truncated message
- **Action**: Deep link to message thread

### Bounty Notifications
- **Application Notifications**: When freelancer applies
- **Assignment Notifications**: When bounty is assigned
- **Completion Notifications**: When bounty is completed

### Custom Notifications
- **Payment Notifications**: Payment status updates
- **System Notifications**: Platform announcements

## Best Practices

### Permission Requests
- ✅ Request at contextually relevant moments
- ✅ Explain benefits clearly
- ✅ Provide easy opt-out
- ❌ Don't request on page load
- ❌ Don't repeatedly prompt

### Notification Content
- ✅ Keep titles under 50 characters
- ✅ Keep body under 120 characters
- ✅ Use clear, actionable language
- ✅ Include relevant context
- ❌ Don't use generic messages

### Technical Considerations
- ✅ Handle subscription failures gracefully
- ✅ Clean up invalid subscriptions
- ✅ Implement proper error logging
- ✅ Use appropriate notification tags
- ✅ Test across different browsers

## Testing

### Local Testing
1. Use HTTPS or localhost for testing
2. Test permission flows in different browsers
3. Verify service worker registration
4. Test notification clicks and actions

### Production Testing
1. Deploy to staging environment first
2. Test with real VAPID keys
3. Verify edge function deployment
4. Test database triggers

## Troubleshooting

### Common Issues

**Notifications not appearing:**
- Check browser permissions
- Verify VAPID keys are correct
- Ensure service worker is registered
- Check browser console for errors

**Edge function errors:**
- Verify deployment with `supabase functions list`
- Check function logs with `supabase functions logs`
- Ensure environment variables are set

**Database trigger issues:**
- Check trigger function exists
- Verify RLS policies allow function access
- Test triggers manually in SQL editor

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (iOS 16.4+)
- Mobile browsers: Varies by platform

## Security Considerations

- VAPID keys are properly secured
- RLS policies protect subscription data
- User consent is properly managed
- Sensitive data is not included in notifications
- Invalid subscriptions are cleaned up automatically

## Performance Optimization

- Service worker caches essential resources
- Notifications are batched when possible
- Invalid subscriptions are removed
- Database queries are optimized with indexes
- Edge function has minimal cold start time