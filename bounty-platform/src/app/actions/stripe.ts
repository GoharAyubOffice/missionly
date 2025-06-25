'use server';

import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient, Prisma } from '@/generated/prisma';

const prisma = new PrismaClient();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export interface ConnectAccountStatus {
  id: string | null;
  status: 'not_connected' | 'pending' | 'verified' | 'restricted';
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  capabilities: {
    transfers: 'active' | 'inactive' | 'pending';
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

// Create or retrieve Stripe Connect Express account for a freelancer
export async function createConnectAccount() {
  try {
    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a Stripe account.',
      };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Only freelancers can create Connect accounts
    if (dbUser.role !== 'FREELANCER') {
      return {
        success: false,
        error: 'Only freelancers can create Stripe Connect accounts.',
      };
    }

    // Check if user already has a Stripe account
    if (dbUser.stripeAccountId) {
      return {
        success: false,
        error: 'You already have a Stripe account connected.',
      };
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: dbUser.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: dbUser.id,
        userRole: dbUser.role,
      },
    });

    // Update user with Stripe account ID
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeAccountId: account.id },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/onboard-return?account_id=${account.id}`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      onboardingUrl: accountLink.url,
      accountId: account.id,
    };
  } catch (error) {
    console.error('Create Connect account error:', error);
    return {
      success: false,
      error: 'Failed to create Stripe account. Please try again.',
    };
  }
}

// Get Stripe Connect account status
export async function getConnectAccountStatus(): Promise<{
  success: boolean;
  data?: ConnectAccountStatus;
  error?: string;
}> {
  try {
    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in.',
      };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // If no Stripe account, return not connected status
    if (!dbUser.stripeAccountId) {
      return {
        success: true,
        data: {
          id: null,
          status: 'not_connected',
          requirements: {
            currently_due: [],
            eventually_due: [],
            past_due: [],
          },
          capabilities: {
            transfers: 'inactive',
          },
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        },
      };
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);

    // Determine status based on account properties
    let status: ConnectAccountStatus['status'] = 'pending';
    
    if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
      status = 'verified';
    } else if (account.requirements?.disabled_reason) {
      status = 'restricted';
    } else if (account.details_submitted) {
      status = 'pending';
    } else {
      status = 'pending';
    }

    return {
      success: true,
      data: {
        id: account.id,
        status,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          past_due: account.requirements?.past_due || [],
        },
        capabilities: {
          transfers: account.capabilities?.transfers || 'inactive',
        },
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        details_submitted: account.details_submitted || false,
      },
    };
  } catch (error) {
    console.error('Get Connect account status error:', error);
    return {
      success: false,
      error: 'Failed to get account status.',
    };
  }
}

// Create account link for re-onboarding
export async function createAccountLink() {
  try {
    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in.',
      };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser || !dbUser.stripeAccountId) {
      return {
        success: false,
        error: 'No Stripe account found.',
      };
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: dbUser.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/onboard-return?account_id=${dbUser.stripeAccountId}`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error('Create account link error:', error);
    return {
      success: false,
      error: 'Failed to create onboarding link.',
    };
  }
}

// Create payment intent for bounty escrow
export async function createPaymentIntent(bountyId: string) {
  try {
    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in.',
      };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Get bounty details
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      include: { client: true },
    });

    if (!bounty) {
      return {
        success: false,
        error: 'Bounty not found.',
      };
    }

    // Only bounty owner can create payment intent
    if (bounty.clientId !== dbUser.id) {
      return {
        success: false,
        error: 'Only the bounty owner can create payment.',
      };
    }

    // Calculate amounts
    const bountyAmount = Math.round(Number(bounty.budget) * 100); // Convert to cents
    const platformFee = Math.round(bountyAmount * 0.03); // 3% platform fee
    const totalAmount = bountyAmount + platformFee;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual', // We'll capture later when work is completed
      metadata: {
        bountyId: bounty.id,
        clientId: dbUser.id,
        bountyAmount: bountyAmount.toString(),
        platformFee: platformFee.toString(),
        type: 'bounty_escrow',
      },
      description: `Escrow payment for bounty: ${bounty.title}`,
    });

    // Create payment record in database
    await prisma.payment.create({
      data: {
        amount: bounty.budget,
        currency: 'USD',
        type: 'BOUNTY_PAYMENT',
        status: 'PENDING',
        stripePaymentId: paymentIntent.id,
        escrowReleased: false,
        processingFee: new Prisma.Decimal(platformFee / 100),
        netAmount: bounty.budget,
        bountyId: bounty.id,
        senderId: dbUser.id,
        receiverId: dbUser.id, // Will be updated when bounty is assigned
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      platformFee: platformFee,
    };
  } catch (error) {
    console.error('Create payment intent error:', error);
    return {
      success: false,
      error: 'Failed to create payment intent.',
    };
  }
}

// Confirm payment (status will be updated via webhook)
export async function confirmPayment(paymentIntentId: string) {
  try {
    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        message: 'Payment confirmed! Your bounty will be published shortly.',
      };
    }
    
    if (paymentIntent.status === 'processing') {
      return {
        success: true,
        message: 'Payment is being processed. Your bounty will be published once payment is confirmed.',
      };
    }

    if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        error: 'Payment requires additional authentication.',
        requiresAction: true,
      };
    }

    return {
      success: false,
      error: 'Payment was not successful. Please try again.',
    };
  } catch (error) {
    console.error('Confirm payment error:', error);
    return {
      success: false,
      error: 'Failed to confirm payment.',
    };
  }
}

// Release escrow payment to freelancer with robust authorization
export async function releaseEscrowPayment(bountyId: string, freelancerId: string) {
  try {
    // Get current user with comprehensive checks
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required. Please log in.',
      };
    }

    // Get current user from database with role verification
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    // Verify user account is active
    if (currentUser.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your account must be active to release payments.',
      };
    }

    // Get bounty with comprehensive data and authorization checks
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            status: true,
            stripeAccountId: true,
          },
        },
        payments: {
          where: { 
            type: 'BOUNTY_PAYMENT', 
            escrowReleased: false,
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        submissions: {
          where: {
            status: { in: ['SUBMITTED', 'APPROVED'] },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!bounty) {
      return {
        success: false,
        error: 'Bounty not found.',
      };
    }

    // AUTHORIZATION CHECK 1: Only bounty owner can release payment
    if (bounty.clientId !== currentUser.id) {
      return {
        success: false,
        error: 'Only the bounty owner can release escrow payment.',
      };
    }

    // AUTHORIZATION CHECK 2: Client account must be active
    if (bounty.client.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Client account is not active.',
      };
    }

    // AUTHORIZATION CHECK 3: Bounty must be in correct status
    if (bounty.status !== 'IN_PROGRESS') {
      return {
        success: false,
        error: 'Payment can only be released for bounties in progress.',
      };
    }

    // AUTHORIZATION CHECK 4: Verify freelancer is assigned to this bounty
    if (!bounty.assigneeId || bounty.assigneeId !== freelancerId) {
      return {
        success: false,
        error: 'The specified freelancer is not assigned to this bounty.',
      };
    }

    // AUTHORIZATION CHECK 5: Verify freelancer account exists and is active
    if (!bounty.assignee || bounty.assignee.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Freelancer account is not active.',
      };
    }

    // AUTHORIZATION CHECK 6: Verify freelancer has Stripe account
    if (!bounty.assignee.stripeAccountId) {
      return {
        success: false,
        error: 'Freelancer does not have a payment account connected.',
      };
    }

    // AUTHORIZATION CHECK 7: Verify there's work submitted
    if (bounty.submissions.length === 0) {
      return {
        success: false,
        error: 'No work has been submitted for this bounty.',
      };
    }

    // AUTHORIZATION CHECK 8: Verify escrow payment exists
    if (bounty.payments.length === 0) {
      return {
        success: false,
        error: 'No escrow payment found for this bounty.',
      };
    }

    const payment = bounty.payments[0];

    // AUTHORIZATION CHECK 9: Verify payment is in correct status
    if (payment.status !== 'PROCESSING') {
      return {
        success: false,
        error: 'Payment is not ready for release.',
      };
    }

    // AUTHORIZATION CHECK 10: Double-check escrow hasn't been released
    if (payment.escrowReleased) {
      return {
        success: false,
        error: 'Escrow payment has already been released.',
      };
    }

    // Now proceed with the payment release (all authorization checks passed)
    console.log(`Releasing escrow payment for bounty ${bountyId} to freelancer ${freelancerId}`);

    // Capture the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.capture(payment.stripePaymentId!);

    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Failed to capture payment from Stripe.',
      };
    }

    // Calculate transfer amount (bounty amount minus platform fee)
    const transferAmount = Math.round(Number(payment.amount) * 100); // Convert to cents

    // Create transfer to freelancer's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination: bounty.assignee.stripeAccountId!,
      metadata: {
        bountyId: bounty.id,
        freelancerId: bounty.assignee.id,
        paymentId: payment.id,
        type: 'escrow_release',
      },
    });

    // Update payment record in database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        escrowReleased: true,
        receiverId: bounty.assignee.id,
        updatedAt: new Date(),
      },
    });

    // Update bounty status to completed
    await prisma.bounty.update({
      where: { id: bountyId },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    });

    // Update freelancer earnings
    await prisma.user.update({
      where: { id: bounty.assignee.id },
      data: {
        totalEarned: {
          increment: payment.amount,
        },
      },
    });

    // Revalidate pages
    revalidatePath(`/bounties/${bountyId}`);
    revalidatePath('/bounties');

    return {
      success: true,
      transferId: transfer.id,
      message: 'Payment released successfully!',
    };
  } catch (error) {
    console.error('Release escrow payment error:', error);
    return {
      success: false,
      error: 'Failed to release payment.',
    };
  }
}