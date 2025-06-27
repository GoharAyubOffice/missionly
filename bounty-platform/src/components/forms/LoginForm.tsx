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
  onGoogleSignIn?: () => Promise<void>;
}

export function LoginForm({ onSubmit, isLoading = false, onForgotPassword, onGoogleSignIn }: LoginFormProps) {
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

      {onGoogleSignIn && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background-primary text-text-secondary">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onGoogleSignIn}
            disabled={isLoading || isSubmitting}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </>
      )}

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