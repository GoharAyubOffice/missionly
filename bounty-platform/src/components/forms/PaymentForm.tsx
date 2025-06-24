'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createPaymentIntent, confirmPayment } from '@/app/actions/stripe';
import { cn } from '@/lib/utils';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  bountyId: string;
  amount: number;
  title: string;
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

export function PaymentForm({ bountyId, amount, title, onSuccess, onCancel, className }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFee, setPlatformFee] = useState(0);

  useEffect(() => {
    createPaymentIntentForBounty();
  }, [bountyId]);

  const createPaymentIntentForBounty = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createPaymentIntent(bountyId);
      
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
        setPlatformFee(result.platformFee / 100); // Convert from cents
      } else {
        setError(result.error || 'Failed to create payment intent');
      }
    } catch (error) {
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PaymentFormLoading className={className} />;
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Payment Error
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={createPaymentIntentForBounty}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentFormContent
        bountyId={bountyId}
        paymentIntentId={paymentIntentId}
        amount={amount}
        platformFee={platformFee}
        title={title}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    </Elements>
  );
}

interface PaymentFormContentProps {
  bountyId: string;
  paymentIntentId: string | null;
  amount: number;
  platformFee: number;
  title: string;
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

function PaymentFormContent({
  bountyId,
  paymentIntentId,
  amount,
  platformFee,
  title,
  onSuccess,
  onCancel,
  className
}: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntentId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bounties/${bountyId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      // Confirm payment on our server
      const result = await confirmPayment(paymentIntentId);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to confirm payment');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = amount + platformFee;

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Secure Payment
        </h2>
        <p className="text-text-secondary text-sm">
          Complete your payment to publish the bounty and hold funds in escrow.
        </p>
      </div>

      {/* Bounty Summary */}
      <div className="bg-background-secondary border border-border rounded-lg p-4 mb-6">
        <h3 className="font-medium text-text-primary mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Bounty Amount:</span>
            <span className="font-medium text-text-primary">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Platform Fee (3%):</span>
            <span className="font-medium text-text-primary">${platformFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium text-text-primary">Total:</span>
              <span className="font-bold text-lg text-text-primary">${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-primary-blue/10 border border-primary-blue/20 rounded-lg">
          <p className="text-xs text-primary-blue">
            <strong>Escrow Protection:</strong> Your payment is held securely until the work is completed to your satisfaction.
          </p>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Payment Method
          </label>
          <div className="border border-border rounded-lg p-4 bg-background-primary">
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
              }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-background-secondary border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-1">
                Secure Payment Processing
              </h4>
              <p className="text-xs text-text-secondary">
                Your payment information is encrypted and processed securely by Stripe. 
                We never store your payment details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!stripe || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : `Pay $${totalAmount.toLocaleString()}`}
          </Button>
        </div>
      </form>

      {/* Terms */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          By completing this payment, you agree to our{' '}
          <a href="/terms" className="text-primary-blue hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-blue hover:underline">Privacy Policy</a>.
          Payments are processed by Stripe.
        </p>
      </div>
    </Card>
  );
}

// Loading component
function PaymentFormLoading({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6">
        <div className="h-6 w-32 bg-border rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-border rounded animate-pulse" />
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-4 mb-6">
        <div className="h-5 w-32 bg-border rounded animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-border rounded animate-pulse" />
            <div className="h-4 w-16 bg-border rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-border rounded animate-pulse" />
            <div className="h-4 w-12 bg-border rounded animate-pulse" />
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-border rounded animate-pulse" />
              <div className="h-5 w-20 bg-border rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="h-4 w-24 bg-border rounded animate-pulse mb-3" />
          <div className="border border-border rounded-lg p-4 bg-background-primary">
            <div className="h-12 w-full bg-border rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-border rounded animate-pulse" />
          <div className="h-10 flex-1 bg-border rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}