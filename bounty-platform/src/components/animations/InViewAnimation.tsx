'use client';

import React from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { ANIMATION_PRESETS, AnimationPreset } from '@/lib/animations';

export interface InViewAnimationProps {
  children: React.ReactNode;
  animation?: AnimationPreset | Variants;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const InViewAnimation: React.FC<InViewAnimationProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration,
  threshold = 0.1,
  once = true,
  className,
  as: Component = 'div',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  // Get animation variants
  const variants = typeof animation === 'string' 
    ? ANIMATION_PRESETS[animation] 
    : animation;

  // Apply custom duration if provided
  const customVariants = duration ? {
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...variants.animate?.transition,
        duration,
      },
    },
  } : variants;

  // Apply delay if provided
  const delayedVariants = delay > 0 ? {
    ...customVariants,
    animate: {
      ...customVariants.animate,
      transition: {
        ...customVariants.animate?.transition,
        delay,
      },
    },
  } : customVariants;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={delayedVariants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      exit="exit"
      // @ts-ignore - Component prop typing issue
      as={Component}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation component
export interface StaggeredAnimationProps {
  children: React.ReactNode;
  staggerDelay?: number;
  childAnimation?: AnimationPreset | Variants;
  threshold?: number;
  once?: boolean;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 0.1,
  childAnimation = 'slideUp',
  threshold = 0.1,
  once = true,
  className,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const childVariants = typeof childAnimation === 'string' 
    ? ANIMATION_PRESETS[childAnimation] 
    : childAnimation;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Scroll-triggered animation component
export interface ScrollAnimationProps {
  children: React.ReactNode;
  y?: [number, number];
  scale?: [number, number];
  opacity?: [number, number];
  rotate?: [number, number];
  className?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  y,
  scale,
  opacity,
  rotate,
  className,
}) => {
  return (
    <motion.div
      className={className}
      style={{
        y: y ? y : undefined,
        scale: scale ? scale : undefined,
        opacity: opacity ? opacity : undefined,
        rotate: rotate ? rotate : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};

// Counter animation component
export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  className,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        let start = 0;
        const end = value;
        const increment = end / (duration * 60); // 60fps
        
        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(counter);
          } else {
            setCount(Math.floor(start));
          }
        }, 1000 / 60);

        return () => clearInterval(counter);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Typewriter effect component
export interface TypewriterProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
  cursor?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  delayBetweenTexts = 2000,
  className,
  cursor = true,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), delayBetweenTexts);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, delayBetweenTexts]);

  return (
    <span className={className}>
      {currentText}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          |
        </motion.span>
      )}
    </span>
  );
};