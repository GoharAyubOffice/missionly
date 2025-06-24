import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromPushNotifications } from '@/app/actions/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const result = await unsubscribeFromPushNotifications(body.userId);

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
    console.error('Push unsubscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}