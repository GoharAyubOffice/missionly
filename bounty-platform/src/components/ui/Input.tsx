import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'default' | 'search';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    helperText,
    error,
    variant = 'default',
    leftIcon,
    rightIcon,
    disabled,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const hasError = Boolean(error);
    
    const inputClasses = cn(
      // Base styles
      'w-full font-body transition-colors duration-standard',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Variant styles
      {
        'h-input px-16 rounded-button border-2 bg-background-primary text-text-primary': variant === 'default',
        'h-search-input pl-12 pr-16 rounded-search border bg-background-secondary text-text-primary': variant === 'search',
      },
      // State styles
      {
        'border-border focus:border-border-focus focus:ring-primary-blue': !hasError,
        'border-error focus:border-error focus:ring-error': hasError,
      },
      // Icon padding adjustments
      leftIcon && variant === 'default' ? 'pl-12' : '',
      rightIcon && variant === 'default' ? 'pr-12' : '',
      className
    );

    const containerClasses = cn(
      'relative',
      {
        'w-full': variant === 'default',
      }
    );

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-label font-medium',
              hasError ? 'text-error' : 'text-text-primary'
            )}
          >
            {label}
          </label>
        )}
        
        <div className={containerClasses}>
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              cn(
                helperText && `${inputId}-helper`,
                error && `${inputId}-error`
              ) || undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="text-body-small text-text-secondary"
          >
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-body-small text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'variant' | 'leftIcon' | 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClearButton = true, rightIcon, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(Boolean(props.value || props.defaultValue));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    const handleClear = () => {
      setHasValue(false);
      onClear?.();
    };

    const searchIcon = (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

    const clearIcon = showClearButton && hasValue ? (
      <button
        type="button"
        onClick={handleClear}
        className="text-text-muted hover:text-text-primary transition-colors duration-micro"
        tabIndex={-1}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    ) : rightIcon;

    return (
      <Input
        ref={ref}
        type="search"
        variant="search"
        leftIcon={searchIcon}
        rightIcon={clearIcon}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';