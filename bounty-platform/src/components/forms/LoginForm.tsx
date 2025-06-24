'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  onForgotPassword?: (email: string) => Promise<void>;
}

export function LoginForm({ onSubmit, isLoading = false, onForgotPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const email = watch('email');

  const handleForgotPassword = async () => {
    if (!onForgotPassword) return;
    
    const emailToUse = forgotPasswordEmail || email;
    if (!emailToUse) return;

    setForgotPasswordLoading(true);
    try {
      await onForgotPassword(emailToUse);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } finally {
      setForgotPasswordLoading(false);
    }
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

  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-h2 font-bold text-text-primary mb-2">
            Reset Your Password
          </h2>
          <p className="text-body text-text-secondary">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            disabled={forgotPasswordLoading}
          />

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
              }}
              disabled={forgotPasswordLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleForgotPassword}
              loading={forgotPasswordLoading}
              disabled={!forgotPasswordEmail || forgotPasswordLoading}
              className="flex-1"
            >
              Send Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          error={errors.email?.message}
          disabled={isLoading || isSubmitting}
          autoComplete="email"
        />

        <Input
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          error={errors.password?.message}
          disabled={isLoading || isSubmitting}
          autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
              disabled={isLoading || isSubmitting}
            />
            <span className="text-body text-text-secondary">Remember me</span>
          </label>

          {onForgotPassword && (
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordEmail(email || '');
              }}
              className="text-body text-primary-blue hover:underline focus:outline-none focus:underline"
              disabled={isLoading || isSubmitting}
            >
              Forgot password?
            </button>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading || isSubmitting}
        disabled={isLoading || isSubmitting}
        className="w-full"
      >
        Sign In
      </Button>

      <div className="text-center">
        <p className="text-body text-text-secondary">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-blue hover:underline font-medium">
            Create one
          </a>
        </p>
      </div>
    </form>
  );
}