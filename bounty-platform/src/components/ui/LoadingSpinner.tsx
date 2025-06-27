'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-primary-blue',
  secondary: 'text-text-secondary',
  white: 'text-white',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  return (
    <motion.div
      className={cn('inline-block', className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg
        className={cn(sizeClasses[size], colorClasses[color])}
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Pulse loading component for skeleton screens
export interface PulseLoadingProps {
  className?: string;
  children?: React.ReactNode;
}

export const PulseLoading: React.FC<PulseLoadingProps> = ({
  className,
  children,
}) => {
  return (
    <motion.div
      className={cn('bg-gray-200 rounded', className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Dots loading animation
export interface DotsLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const DotsLoading: React.FC<DotsLoadingProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotColors = {
    primary: 'bg-primary-blue',
    secondary: 'bg-text-secondary',
    white: 'bg-white',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-full',
            dotSizes[size],
            dotColors[color]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Wave loading animation
export interface WaveLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const WaveLoading: React.FC<WaveLoadingProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const barSizes = {
    sm: 'w-1 h-4',
    md: 'w-1 h-6',
    lg: 'w-1.5 h-8',
  };

  const barColors = {
    primary: 'bg-primary-blue',
    secondary: 'bg-text-secondary',
    white: 'bg-white',
  };

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-sm',
            barSizes[size],
            barColors[color]
          )}
          animate={{
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};