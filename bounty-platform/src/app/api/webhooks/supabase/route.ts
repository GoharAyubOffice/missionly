import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Types for Supabase webhook events
interface SupabaseWebhookEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record?: any;
  old_record?: any;
  schema: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (you should add this for production)
    // const signature = request.headers.get('authorization');
    
    const event: SupabaseWebhookEvent = await request.json();
    
    console.log('Supabase webhook received:', event);

    // Handle user creation after email confirmation
    if (event.type === 'UPDATE' && event.table === 'users' && event.schema === 'auth') {
      const user = event.record;
      
      // Check if email was just confirmed
      if (user.email_confirmed_at && !event.old_record?.email_confirmed_at) {
        console.log('User email confirmed, creating profile:', user.id);
        
        try {
          // Get user metadata from Supabase
          const userRole = user.raw_user_meta_data?.role || 'CLIENT';
          const userName = user.raw_user_meta_data?.name || user.email?.split('@')[0];
          
          // Create user profile in our database
          await prisma.user.upsert({
            where: { supabaseId: user.id },
            update: {
              status: 'ACTIVE',
            },
            create: {
              id: user.id,
              email: user.email.toLowerCase(),
              name: userName,
              role: userRole === 'CLIENT' ? 'CLIENT' : 'FREELANCER',
              supabaseId: user.id,
              status: 'ACTIVE',
            },
          });
          
          console.log('User profile created successfully for:', user.id);
        } catch (dbError) {
          console.error('Failed to create user profile:', dbError);
          // Don't fail the webhook, just log the error
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// For testing purposes
export async function GET() {
  return NextResponse.json({ message: 'Supabase webhook endpoint' });
}