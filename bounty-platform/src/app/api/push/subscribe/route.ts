import { NextRequest, NextResponse } from 'next/server';
import { subscribeToPushNotifications, type PushSubscriptionData } from '@/app/actions/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.subscription || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: subscription and userId' },
        { status: 400 }
      );
    }

    if (!body.subscription.endpoint || !body.subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    if (!body.subscription.keys.p256dh || !body.subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Missing subscription keys' },
        { status: 400 }
      );
    }

    const subscriptionData: PushSubscriptionData = {
      subscription: {
        endpoint: body.subscription.endpoint,
        keys: {
          p256dh: body.subscription.keys.p256dh,
          auth: body.subscription.keys.auth,
        },
      },
      userId: body.userId,
      threadIds: body.threadIds || [],
    };

    const result = await subscribeToPushNotifications(subscriptionData);

    if (result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Push subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}