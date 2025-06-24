import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonHover, buttonTap } from '@/lib/animations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  variant: {
    primary: 'bg-primary-blue text-primary-white hover:bg-[#154360] focus:ring-primary-blue',
    secondary: 'bg-transparent text-primary-blue border-2 border-primary-blue hover:bg-secondary-blue-pale focus:ring-primary-blue',
    success: 'bg-success text-primary-white hover:bg-[#27AE60] focus:ring-success',
    warning: 'bg-accent-orange text-primary-white hover:bg-[#E67E22] focus:ring-accent-orange',
    destructive: 'bg-error text-primary-white hover:bg-[#C0392B] focus:ring-error',
    text: 'bg-transparent text-primary-blue hover:underline focus:ring-primary-blue h-text-button p-0',
  },
  size: {
    sm: 'h-10 px-3 text-sm',
    md: 'h-button px-6 text-button',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl',
  },
};

const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold rounded-button',
          'transition-all duration-standard ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant styles
          buttonVariants.variant[variant],
          // Size styles
          buttonVariants.size[size],
          // Custom class name
          className
        )}
        disabled={isDisabled}
        ref={ref}
        onClick={onClick}
        whileHover={!isDisabled ? buttonHover : undefined}
        whileTap={!isDisabled ? buttonTap : undefined}
        {...props}
      >
        {loading && (
          <LoadingSpinner size={size} />
        )}
        {loading && <span className="ml-2">{children}</span>}
        {!loading && children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';