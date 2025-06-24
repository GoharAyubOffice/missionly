'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormData } from '@/lib/validators/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RegistrationForm({ onSubmit, isLoading = false }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
  });

  const password = watch('password');
  const email = watch('email');

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
  };

  const passwordStrength = password ? getPasswordStrength(password) : 'weak';

  const PasswordStrengthIndicator = () => {
    if (!password || !touchedFields.password) return null;

    const strengthColors = {
      weak: 'bg-error',
      medium: 'bg-accent-orange',
      strong: 'bg-success'
    };

    const strengthText = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong'
    };

    const strengthWidth = {
      weak: 'w-1/3',
      medium: 'w-2/3',
      strong: 'w-full'
    };

    return (
      <div className="mt-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-body-small text-text-secondary">Password strength:</span>
          <span className={cn(
            'text-body-small font-medium',
            passwordStrength === 'weak' && 'text-error',
            passwordStrength === 'medium' && 'text-accent-orange',
            passwordStrength === 'strong' && 'text-success'
          )}>
            {strengthText[passwordStrength]}
          </span>
        </div>
        <div className="w-full bg-border-light rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              strengthColors[passwordStrength],
              strengthWidth[passwordStrength]
            )}
          />
        </div>
      </div>
    );
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg
      className="w-5 h-5 cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {show ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l-2.829-2.829m-2.828 2.829l-1.414-1.414M8.464 8.464L6.343 6.343"
        />
      )}
    </svg>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register('name')}
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          disabled={isLoading || isSubmitting}
        />

        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          error={errors.email?.message}
          disabled={isLoading || isSubmitting}
        />

        <div>
          <Input
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            error={errors.password?.message}
            disabled={isLoading || isSubmitting}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                <EyeIcon show={showPassword} />
              </button>
            }
          />
          <PasswordStrengthIndicator />
        </div>

        <Input
          {...register('confirmPassword')}
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          disabled={isLoading || isSubmitting}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              <EyeIcon show={showConfirmPassword} />
            </button>
          }
        />

        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            I am a:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={cn(
              'relative flex items-center justify-center p-4 border-2 rounded-button cursor-pointer transition-all duration-standard',
              'hover:border-primary-blue focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2',
              errors.role ? 'border-error' : 'border-border'
            )}>
              <input
                {...register('role')}
                type="radio"
                value="CLIENT"
                className="sr-only"
                disabled={isLoading || isSubmitting}
              />
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-primary-blue rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6H6a2 2 0 00-2 2v6a2 2 0 002 2h2m8-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Business</h3>
                <p className="text-body-small text-text-secondary mt-1">Post projects and hire talent</p>
              </div>
            </label>

            <label className={cn(
              'relative flex items-center justify-center p-4 border-2 rounded-button cursor-pointer transition-all duration-standard',
              'hover:border-primary-blue focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2',
              errors.role ? 'border-error' : 'border-border'
            )}>
              <input
                {...register('role')}
                type="radio"
                value="FREELANCER"
                className="sr-only"
                disabled={isLoading || isSubmitting}
              />
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-primary-blue rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Marketer</h3>
                <p className="text-body-small text-text-secondary mt-1">Find work and build your career</p>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="text-body-small text-error mt-2" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            {...register('terms')}
            type="checkbox"
            className={cn(
              'mt-1 w-4 h-4 text-primary-blue border-2 rounded focus:ring-2 focus:ring-primary-blue focus:ring-offset-2',
              errors.terms ? 'border-error' : 'border-border'
            )}
            disabled={isLoading || isSubmitting}
          />
          <div className="flex-1">
            <span className="text-body text-text-primary">
              I agree to the{' '}
              <a href="/terms" className="text-primary-blue hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary-blue hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
            {errors.terms && (
              <p className="text-body-small text-error mt-1" role="alert">
                {errors.terms.message}
              </p>
            )}
          </div>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading || isSubmitting}
        disabled={isLoading || isSubmitting}
        className="w-full"
      >
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-body text-text-secondary">
          Already have an account?{' '}
          <a href="/login" className="text-primary-blue hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
}