import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // Workaround: force headersList to any due to TS type mismatch
    const headersList = headers() as any;
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received Stripe webhook event:', event.type, event.id);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent succeeded:', paymentIntent.id);

    const bountyId = paymentIntent.metadata.bountyId;
    if (!bountyId) {
      console.error('No bountyId in payment intent metadata');
      return;
    }

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: { bounty: true },
    });

    if (!payment) {
      console.error('Payment record not found for payment intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING',
        updatedAt: new Date(),
      },
    });

    // Publish the bounty (make it visible to freelancers)
    await prisma.bounty.update({
      where: { id: bountyId },
      data: {
        status: 'OPEN',
        updatedAt: new Date(),
      },
    });

    console.log(`Bounty ${bountyId} published successfully after payment`);

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent failed:', paymentIntent.id);

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });

      // Keep bounty in DRAFT status since payment failed
      const bountyId = paymentIntent.metadata.bountyId;
      if (bountyId) {
        await prisma.bounty.update({
          where: { id: bountyId },
          data: {
            status: 'DRAFT',
            updatedAt: new Date(),
          },
        });
      }
    }

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// Handle canceled payment intent
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent canceled:', paymentIntent.id);

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });

      // Keep bounty in DRAFT status since payment was canceled
      const bountyId = paymentIntent.metadata.bountyId;
      if (bountyId) {
        await prisma.bounty.update({
          where: { id: bountyId },
          data: {
            status: 'DRAFT',
            updatedAt: new Date(),
          },
        });
      }
    }

  } catch (error) {
    console.error('Error handling payment intent canceled:', error);
  }
}

// Handle account updates (for Connect accounts)
async function handleAccountUpdated(account: Stripe.Account) {
  try {
    console.log('Processing account updated:', account.id);

    // Update user record with latest account status
    const user = await prisma.user.findFirst({
      where: { stripeAccountId: account.id },
    });

    if (user) {
      // You could store additional account status information here
      await prisma.user.update({
        where: { id: user.id },
        data: {
          updatedAt: new Date(),
        },
      });

      console.log(`User ${user.id} Stripe account updated`);
    }

  } catch (error) {
    console.error('Error handling account updated:', error);
  }
}

// Handle transfer creation (when funds are sent to freelancer)
async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    console.log('Processing transfer created:', transfer.id);

    const bountyId = transfer.metadata?.bountyId;
    const freelancerId = transfer.metadata?.freelancerId;
    const paymentId = transfer.metadata?.paymentId;

    if (paymentId) {
      // Update payment record to reflect successful transfer
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });

      console.log(`Payment ${paymentId} transfer completed successfully`);
    }

  } catch (error) {
    console.error('Error handling transfer created:', error);
  }
}

// Handle GET requests (for webhook endpoint verification)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Stripe webhook endpoint is active' },
    { status: 200 }
  );
}