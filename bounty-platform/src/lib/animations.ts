import { Variants } from 'framer-motion';

// Animation durations based on design tokens
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  modal: 0.3,
  page: 0.4,
  success: 0.5,
} as const;

// Animation easing functions based on design tokens
export const ANIMATION_EASE = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  emphasis: [0.4, 0.0, 0.2, 1],
  page: [0.2, 0.8, 0.2, 1],
  spring: [0.2, 0.8, 0.2, 1],
} as const;

// Fade in animation
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Slide up animation
export const slideUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Slide down animation
export const slideDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Scale in animation (for modals)
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.modal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Slide from left
export const slideFromLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Slide from right
export const slideFromRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Stagger children animation
export const staggerChildren: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Page transition animations
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.page,
      ease: ANIMATION_EASE.page,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: {
    duration: ANIMATION_DURATION.fast,
    ease: ANIMATION_EASE.easeOut,
  },
};

// Button tap animation
export const buttonTap = {
  scale: 0.98,
  transition: {
    duration: ANIMATION_DURATION.fast,
    ease: ANIMATION_EASE.easeOut,
  },
};

// Card hover animation
export const cardHover = {
  y: -2,
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
  transition: {
    duration: ANIMATION_DURATION.normal,
    ease: ANIMATION_EASE.easeOut,
  },
};

// Loading pulse animation
export const loadingPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Success checkmark animation
export const successCheckmark: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.success,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Error shake animation
export const errorShake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Toast notification animations
export const toastSlideIn: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.spring,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.easeOut,
    },
  },
};

// Utility function to get reduced motion variants
export function getReducedMotionVariants(variants: Variants): Variants {
  const reducedVariants: Variants = {};
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null) {
      reducedVariants[key] = {
        ...variant,
        transition: {
          duration: 0.01,
        },
      };
    } else {
      reducedVariants[key] = variant;
    }
  });
  
  return reducedVariants;
}

// Common animation presets
export const ANIMATION_PRESETS = {
  fadeIn,
  slideUp,
  slideDown,
  scaleIn,
  slideFromLeft,
  slideFromRight,
  staggerChildren,
  pageTransition,
  loadingPulse,
  successCheckmark,
  errorShake,
  toastSlideIn,
} as const;

export type AnimationPreset = keyof typeof ANIMATION_PRESETS;