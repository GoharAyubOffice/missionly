'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/forms/LoginForm';
import { loginAction, forgotPasswordAction } from '@/app/actions/auth';
import { signInWithGoogle } from '@/lib/auth-client';
import { type LoginFormData } from '@/lib/validators/auth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    const errorParam = searchParams.get('error');
    
    if (message === 'registration-success') {
      setSuccessMessage('Registration successful! Please check your email to verify your account, then log in.');
    } else if (message === 'verification-success') {
      setSuccessMessage('Email verified successfully! You can now log in to your account.');
    } else if (message === 'password-reset') {
      setSuccessMessage('Password reset successfully! You can now log in with your new password.');
    } else if (errorParam) {
      switch (errorParam) {
        case 'oauth-cancelled':
          setError('Google sign-in was cancelled. Please try again.');
          break;
        case 'oauth-error':
          setError('Google sign-in failed. Please try again or use email/password.');
          break;
        case 'auth-error':
          setError('Authentication failed. Please try again.');
          break;
        case 'profile-creation-failed':
          setError('Failed to create user profile. Please contact support.');
          break;
        case 'no-code':
          setError('Authentication failed. Please try again.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAction(data);
      
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const result = await forgotPasswordAction(email);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Password reset email sent successfully.');
        setError(null);
      } else {
        setError(result.error || 'Failed to send password reset email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Forgot password error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // User will be redirected by the OAuth flow
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during Google sign-in.';
      setError(errorMessage);
      console.error('Google sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h1 font-bold text-text-primary mb-2">
          Welcome Back
        </h1>
        <p className="text-body text-text-secondary">
          Sign in to your account to continue
        </p>
      </div>

      {successMessage && (
        <div className="bg-success-pale border border-success rounded-card p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-body text-success">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-pale border border-error rounded-card p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-body text-error">{error}</p>
          </div>
        </div>
      )}

      <LoginForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
}