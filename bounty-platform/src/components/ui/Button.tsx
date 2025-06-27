import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonHover, buttonTap } from '@/lib/animations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'text' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animation?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  variant: {
    primary: 'bg-primary-blue text-primary-white hover:bg-[#154360] focus:ring-primary-blue shadow-lg',
    secondary: 'bg-transparent text-primary-blue border-2 border-primary-blue hover:bg-secondary-blue-pale focus:ring-primary-blue',
    success: 'bg-success text-primary-white hover:bg-[#27AE60] focus:ring-success shadow-lg',
    warning: 'bg-accent-orange text-primary-white hover:bg-[#E67E22] focus:ring-accent-orange shadow-lg',
    destructive: 'bg-error text-primary-white hover:bg-[#C0392B] focus:ring-error shadow-lg',
    text: 'bg-transparent text-primary-blue hover:underline focus:ring-primary-blue h-text-button p-0',
    gradient: 'bg-gradient-to-r from-primary-blue to-secondary-blue-light text-primary-white hover:shadow-xl focus:ring-primary-blue shadow-lg',
  },
  size: {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl',
  },
};

const LoadingSpinner = ({ 
  size, 
  color = 'white' 
}: { 
  size: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'primary';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const colorClasses = {
    white: 'text-white',
    primary: 'text-primary-blue',
  };

  return (
    <motion.svg
      className={cn('animate-spin', sizeClasses[size], colorClasses[color])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
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
    </motion.svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    animation = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const [isPressed, setIsPressed] = React.useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        onClick(e);
      }
    };

    const motionProps = animation ? {
      whileHover: !isDisabled ? { 
        scale: 1.02, 
        y: -1,
        transition: { duration: 0.2 }
      } : undefined,
      whileTap: !isDisabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined,
    } : {};

    return (
      <motion.button
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-all duration-300 ease-out overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant styles
          buttonVariants.variant[variant],
          // Size styles
          buttonVariants.size[size],
          // Full width
          fullWidth && 'w-full',
          // Custom class name
          className
        )}
        disabled={isDisabled}
        ref={ref}
        onClick={handleClick}
        {...motionProps}
        {...(props as any)}
      >
        {/* Ripple effect */}
        <AnimatePresence>
          {isPressed && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-xl"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
        
        {/* Gradient overlay for gradient variant */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        {/* Content */}
        <span className="relative flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <LoadingSpinner size={size} color={variant === 'secondary' || variant === 'text' ? 'primary' : 'white'} />
              <span>Loading...</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
              <span>{children}</span>
              {icon && iconPosition === 'right' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'p-0 aspect-square rounded-full',
          iconSizes[size],
          className
        )}
        size={size}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button Group Component
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>*:not(:first-child)]:ml-[-1px] [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none',
        orientation === 'vertical' && '[&>*:not(:first-child)]:mt-[-1px] [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:rounded-t-none',
        className
      )}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';