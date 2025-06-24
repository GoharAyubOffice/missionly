'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { registrationAction } from '@/app/actions/auth';
import { type RegistrationFormData } from '@/lib/validators/auth';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registrationAction(data);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=registration-success');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-success rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-h2 font-bold text-text-primary">Account Created Successfully!</h2>
        <p className="text-body text-text-secondary max-w-sm mx-auto">
          Please check your email inbox for a verification link to activate your account. 
          You'll be redirected to the login page shortly.
        </p>
        <div className="w-8 h-8 mx-auto">
          <svg className="animate-spin w-8 h-8 text-primary-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h1 font-bold text-text-primary mb-2">
          Create Your Account
        </h1>
        <p className="text-body text-text-secondary">
          Join thousands of businesses and talented marketers
        </p>
      </div>

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

      <RegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}