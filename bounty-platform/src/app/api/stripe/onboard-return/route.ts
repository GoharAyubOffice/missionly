import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      // Redirect to settings with error
      return redirect('/settings/payments?error=missing_account_id');
    }

    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return redirect('/login?error=authentication_required');
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return redirect('/settings/payments?error=user_not_found');
    }

    // Verify the account belongs to this user
    if (dbUser.stripeAccountId !== accountId) {
      return redirect('/settings/payments?error=account_mismatch');
    }

    // Retrieve account details from Stripe to check onboarding status
    const account = await stripe.accounts.retrieve(accountId);

    // Determine success/failure based on account status
    if (account.details_submitted) {
      // Onboarding completed successfully
      const status = account.charges_enabled && account.payouts_enabled ? 'verified' : 'pending';
      return redirect(`/settings/payments?success=onboarding_complete&status=${status}`);
    } else {
      // Onboarding incomplete
      return redirect('/settings/payments?error=onboarding_incomplete');
    }

  } catch (error) {
    console.error('Stripe onboard return error:', error);
    return redirect('/settings/payments?error=onboarding_failed');
  }
}

// Handle POST requests for webhook processing (optional)
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle account update events
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      
      // Update user's account status in database if needed
      await prisma.user.updateMany({
        where: { stripeAccountId: account.id },
        data: {
          // You could store additional status information here
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}