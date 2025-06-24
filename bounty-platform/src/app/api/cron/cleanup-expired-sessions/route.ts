import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean up old push subscriptions that haven't been used
    const deletedSubscriptions = await prisma.pushSubscription.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Clean up old notification logs
    const deletedLogs = await prisma.$executeRaw`
      DELETE FROM notification_logs 
      WHERE sent_at < ${thirtyDaysAgo}
    `;

    // Clean up expired Stripe payment intents (if you track them)
    // This would depend on your specific implementation

    const result = {
      success: true,
      cleaned_up: {
        push_subscriptions: deletedSubscriptions.count,
        notification_logs: deletedLogs,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('Cleanup completed:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cleanup cron job failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cleanup failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}