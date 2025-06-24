'use client';

import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { 
  ANIMATION_PRESETS, 
  AnimationPreset, 
  getReducedMotionVariants,
  ANIMATION_DURATION 
} from '@/lib/animations';

export interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: AnimationPreset | Variants;
  delay?: number;
  duration?: keyof typeof ANIMATION_DURATION;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  inView?: boolean;
  once?: boolean;
  threshold?: number;
  margin?: string;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration,
  className,
  as = 'div',
  inView = false,
  once = true,
  threshold = 0.1,
  margin = '0px',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion[as as keyof typeof motion] as any;

  // Get animation variants
  const getVariants = (): Variants => {
    let variants: Variants;

    if (typeof animation === 'string') {
      variants = ANIMATION_PRESETS[animation];
    } else {
      variants = animation;
    }

    // Apply reduced motion if user prefers it
    if (shouldReduceMotion) {
      return getReducedMotionVariants(variants);
    }

    // Apply custom duration if provided
    if (duration && variants.animate && typeof variants.animate === 'object') {
      variants = {
        ...variants,
        animate: {
          ...variants.animate,
          transition: {
            ...((variants.animate as any).transition || {}),
            duration: ANIMATION_DURATION[duration],
          },
        },
      };
    }

    // Apply delay if provided
    if (delay > 0 && variants.animate && typeof variants.animate === 'object') {
      variants = {
        ...variants,
        animate: {
          ...variants.animate,
          transition: {
            ...((variants.animate as any).transition || {}),
            delay,
          },
        },
      };
    }

    return variants;
  };

  const variants = getVariants();

  // Base animation props
  const animationProps: any = {
    variants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  };

  // Add viewport animation if inView is enabled
  if (inView) {
    animationProps.whileInView = 'animate';
    animationProps.viewport = {
      once,
      amount: threshold,
      margin,
    };
  }

  return (
    <MotionComponent
      className={className}
      {...animationProps}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

// Specialized wrapper for staggered children
export interface StaggerWrapperProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  childAnimation?: AnimationPreset | Variants;
}

export const StaggerWrapper: React.FC<StaggerWrapperProps> = ({
  children,
  staggerDelay = 0.1,
  className,
  as = 'div',
  childAnimation = 'slideUp',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion[as as keyof typeof motion] as any;

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };

  const childVariants = typeof childAnimation === 'string' 
    ? ANIMATION_PRESETS[childAnimation] 
    : childAnimation;

  const finalChildVariants = shouldReduceMotion 
    ? getReducedMotionVariants(childVariants)
    : childVariants;

  return (
    <MotionComponent
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={finalChildVariants}>
          {child}
        </motion.div>
      ))}
    </MotionComponent>
  );
};

// Page transition wrapper
export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  return (
    <AnimatedWrapper
      animation="pageTransition"
      className={className}
      as="div"
    >
      {children}
    </AnimatedWrapper>
  );
};

// InView animation wrapper
export interface InViewAnimationProps {
  children: React.ReactNode;
  animation?: AnimationPreset | Variants;
  once?: boolean;
  threshold?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const InViewAnimation: React.FC<InViewAnimationProps> = ({
  children,
  animation = 'slideUp',
  once = true,
  threshold = 0.1,
  className,
  as = 'div',
}) => {
  return (
    <AnimatedWrapper
      animation={animation}
      inView
      once={once}
      threshold={threshold}
      className={className}
      as={as}
    >
      {children}
    </AnimatedWrapper>
  );
};

// Hover animation wrapper
export interface HoverAnimationProps {
  children: React.ReactNode;
  scale?: number;
  y?: number;
  rotateX?: number;
  rotateY?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  scale = 1.02,
  y = -2,
  rotateX,
  rotateY,
  className,
  as = 'div',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion[as as keyof typeof motion] as any;

  const hoverAnimation = shouldReduceMotion
    ? {}
    : {
        scale,
        y,
        ...(rotateX && { rotateX }),
        ...(rotateY && { rotateY }),
        transition: {
          duration: ANIMATION_DURATION.fast,
          ease: [0.0, 0.0, 0.2, 1],
        },
      };

  return (
    <MotionComponent
      className={className}
      whileHover={hoverAnimation}
    >
      {children}
    </MotionComponent>
  );
};

// Loading animation wrapper
export interface LoadingAnimationProps {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  children,
  size = 'md',
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (children) {
    return (
      <AnimatedWrapper animation="loadingPulse" className={className}>
        {children}
      </AnimatedWrapper>
    );
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className || ''}`}
      animate={
        shouldReduceMotion
          ? {}
          : {
              rotate: 360,
              transition: {
                duration: 1,
                ease: 'linear',
                repeat: Infinity,
              },
            }
      }
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="7.854"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="23.562"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  );
};