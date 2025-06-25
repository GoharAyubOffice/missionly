'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/app/actions/bounties';
import { 
  createConnectAccount, 
  getConnectAccountStatus, 
  createAccountLink,
  type ConnectAccountStatus 
} from '@/app/actions/stripe';
import { cn } from '@/lib/utils';

interface PaymentSettingsState {
  user: any | null;
  accountStatus: ConnectAccountStatus | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<PaymentSettingsState>({
    user: null,
    accountStatus: null,
    loading: true,
    actionLoading: false,
    error: null,
  });

  // Handle URL parameters for success/error messages
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const status = searchParams.get('status');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Show notifications based on URL parameters
  useEffect(() => {
    if (success === 'onboarding_complete') {
      // Refresh data after successful onboarding
      setTimeout(() => loadData(), 1000);
    }
  }, [success]);

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [userResult, statusResult] = await Promise.all([
        getCurrentUser(),
        getConnectAccountStatus()
      ]);

      if (!userResult.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: userResult.error || 'Failed to load user data' 
        }));
        return;
      }

      if (!statusResult.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: statusResult.error || 'Failed to load account status' 
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        user: userResult.data ?? null,
        accountStatus: statusResult.data ?? null,
        loading: false,
        error: null,
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred' 
      }));
    }
  };

  const handleCreateAccount = async () => {
    setState(prev => ({ ...prev, actionLoading: true }));
    
    try {
      const result = await createConnectAccount();
      
      if (result.success && result.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingUrl;
      } else {
        setState(prev => ({ 
          ...prev, 
          actionLoading: false, 
          error: result.error || 'Failed to create account' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        actionLoading: false, 
        error: 'Failed to create account' 
      }));
    }
  };

  const handleContinueOnboarding = async () => {
    setState(prev => ({ ...prev, actionLoading: true }));
    
    try {
      const result = await createAccountLink();
      
      if (result.success && result.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingUrl;
      } else {
        setState(prev => ({ 
          ...prev, 
          actionLoading: false, 
          error: result.error || 'Failed to create onboarding link' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        actionLoading: false, 
        error: 'Failed to continue onboarding' 
      }));
    }
  };

  const getStatusIcon = (status: ConnectAccountStatus['status']) => {
    switch (status) {
      case 'verified':
        return <span className="text-success text-xl">✓</span>;
      case 'pending':
        return <span className="text-accent-orange text-xl">⏳</span>;
      case 'restricted':
        return <span className="text-error text-xl">⚠️</span>;
      case 'not_connected':
        return <span className="text-text-muted text-xl">○</span>;
      default:
        return <span className="text-text-muted text-xl">○</span>;
    }
  };

  const getStatusColor = (status: ConnectAccountStatus['status']) => {
    switch (status) {
      case 'verified':
        return 'text-success bg-success/10 border-success/20';
      case 'pending':
        return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'restricted':
        return 'text-error bg-error/10 border-error/20';
      case 'not_connected':
        return 'text-text-muted bg-border/10 border-border/20';
      default:
        return 'text-text-muted bg-border/10 border-border/20';
    }
  };

  const getStatusText = (status: ConnectAccountStatus['status']) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'restricted':
        return 'Restricted';
      case 'not_connected':
        return 'Not Connected';
      default:
        return 'Unknown';
    }
  };

  if (state.loading) {
    return <PaymentSettingsLoading />;
  }

  if (!state.user) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Authentication Required
            </h2>
            <p className="text-text-secondary mb-4">
              Please log in to access payment settings.
            </p>
            <Button variant="primary" onClick={() => router.push('/login')}>
              Log In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Only freelancers need Stripe Connect accounts
  if (state.user.role !== 'FREELANCER') {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-text-primary mb-6">
              Payment Settings
            </h1>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-blue/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Client Account
                </h2>
                <p className="text-text-secondary">
                  Payment settings are only available for freelancers. As a client, you'll make payments directly when posting bounties.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-text-primary mb-6">
            Payment Settings
          </h1>

          {/* Success/Error Messages */}
          {success === 'onboarding_complete' && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-success text-xl">✓</span>
                <div>
                  <h3 className="font-medium text-success">Onboarding Complete!</h3>
                  <p className="text-sm text-success/80">
                    {status === 'verified' 
                      ? 'Your account is verified and ready to receive payments.'
                      : 'Your information has been submitted and is being reviewed.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-error text-xl">⚠️</span>
                <div>
                  <h3 className="font-medium text-error">Onboarding Issue</h3>
                  <p className="text-sm text-error/80">
                    {error === 'onboarding_incomplete' && 'Please complete the onboarding process to start receiving payments.'}
                    {error === 'onboarding_failed' && 'There was an issue with the onboarding process. Please try again.'}
                    {error === 'missing_account_id' && 'Invalid account information. Please try again.'}
                    {error === 'account_mismatch' && 'Account verification failed. Please contact support.'}
                    {!['onboarding_incomplete', 'onboarding_failed', 'missing_account_id', 'account_mismatch'].includes(error) && 'An error occurred. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {state.error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-error text-xl">⚠️</span>
                <div>
                  <h3 className="font-medium text-error">Error</h3>
                  <p className="text-sm text-error/80">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Connect Status */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-1">
                  Stripe Connect Account
                </h2>
                <p className="text-text-secondary text-sm">
                  Connect your Stripe account to receive payments from completed bounties.
                </p>
              </div>
              {getStatusIcon(state.accountStatus?.status || 'not_connected')}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full border',
                  getStatusColor(state.accountStatus?.status || 'not_connected')
                )}>
                  {getStatusText(state.accountStatus?.status || 'not_connected')}
                </span>
              </div>
            </div>

            {/* Status-specific content */}
            {state.accountStatus?.status === 'not_connected' && (
              <div>
                <div className="bg-background-secondary border border-border rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-text-primary mb-2">Get Started with Payments</h3>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Connect your bank account securely through Stripe</li>
                    <li>• Receive payments directly to your account</li>
                    <li>• Track earnings and payment history</li>
                    <li>• Get paid within 2-7 business days</li>
                  </ul>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleCreateAccount}
                  loading={state.actionLoading}
                  disabled={state.actionLoading}
                >
                  Connect Stripe Account
                </Button>
              </div>
            )}

            {state.accountStatus?.status === 'pending' && (
              <div>
                <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-accent-orange mb-2">Verification in Progress</h3>
                  <p className="text-sm text-accent-orange/80 mb-3">
                    Your account information is being reviewed by Stripe. This usually takes 1-2 business days.
                  </p>
                  {state.accountStatus.requirements.currently_due.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-accent-orange mb-2">Missing Information:</p>
                      <ul className="text-sm text-accent-orange/80 space-y-1">
                        {state.accountStatus.requirements.currently_due.map((req, index) => (
                          <li key={index}>• {req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {state.accountStatus.requirements.currently_due.length > 0 && (
                  <Button 
                    variant="primary" 
                    onClick={handleContinueOnboarding}
                    loading={state.actionLoading}
                    disabled={state.actionLoading}
                  >
                    Complete Verification
                  </Button>
                )}
              </div>
            )}

            {state.accountStatus?.status === 'verified' && (
              <div>
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-success mb-2">Account Verified ✓</h3>
                  <p className="text-sm text-success/80">
                    Your Stripe account is verified and ready to receive payments. You'll be paid within 2-7 business days after bounty completion.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Charges Enabled:</span>
                    <span className={cn('ml-2 font-medium', 
                      state.accountStatus.charges_enabled ? 'text-success' : 'text-error'
                    )}>
                      {state.accountStatus.charges_enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Payouts Enabled:</span>
                    <span className={cn('ml-2 font-medium', 
                      state.accountStatus.payouts_enabled ? 'text-success' : 'text-error'
                    )}>
                      {state.accountStatus.payouts_enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {state.accountStatus?.status === 'restricted' && (
              <div>
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-error mb-2">Account Restricted</h3>
                  <p className="text-sm text-error/80 mb-3">
                    Your account has been restricted. Please contact Stripe support or complete the required actions.
                  </p>
                  {state.accountStatus.requirements.past_due.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-error mb-2">Required Actions:</p>
                      <ul className="text-sm text-error/80 space-y-1">
                        {state.accountStatus.requirements.past_due.map((req, index) => (
                          <li key={index}>• {req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleContinueOnboarding}
                  loading={state.actionLoading}
                  disabled={state.actionLoading}
                >
                  Resolve Issues
                </Button>
              </div>
            )}
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-text-primary mb-2">Total Earned</h3>
                <p className="text-2xl font-bold text-success">
                  ${state.user.totalEarned.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-2">Platform Fee</h3>
                <p className="text-text-secondary">
                  3% per transaction
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-text-primary mb-3">How Payments Work</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>• Clients pay into escrow when posting bounties</p>
                <p>• Funds are released when you complete the work</p>
                <p>• Payments arrive in your account within 2-7 business days</p>
                <p>• A 3% platform fee is deducted from each payment</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading component
function PaymentSettingsLoading() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl">
          <div className="h-8 w-48 bg-border rounded animate-pulse mb-6" />
          
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-6 w-40 bg-border rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-border rounded animate-pulse" />
              </div>
              <div className="h-6 w-6 bg-border rounded-full animate-pulse" />
            </div>
            
            <div className="h-6 w-32 bg-border rounded-full animate-pulse mb-6" />
            
            <div className="bg-background-secondary border border-border rounded-lg p-4 mb-4">
              <div className="h-5 w-36 bg-border rounded animate-pulse mb-2" />
              <div className="space-y-1">
                <div className="h-4 w-full bg-border rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-border rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-border rounded animate-pulse" />
              </div>
            </div>
            
            <div className="h-10 w-40 bg-border rounded animate-pulse" />
          </Card>
          
          <Card className="p-6">
            <div className="h-6 w-36 bg-border rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-5 w-24 bg-border rounded animate-pulse mb-2" />
                <div className="h-8 w-20 bg-border rounded animate-pulse" />
              </div>
              <div>
                <div className="h-5 w-24 bg-border rounded animate-pulse mb-2" />
                <div className="h-6 w-32 bg-border rounded animate-pulse" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}