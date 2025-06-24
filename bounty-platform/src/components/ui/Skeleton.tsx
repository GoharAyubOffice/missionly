import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'avatar' | 'button' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
  animate?: boolean;
}

const skeletonVariants = {
  text: 'h-4 rounded',
  circular: 'rounded-full aspect-square',
  rectangular: 'rounded',
  avatar: 'w-10 h-10 rounded-full',
  button: 'h-button rounded-button w-32',
  card: 'h-48 rounded-card w-full',
};

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    width,
    height,
    lines = 1,
    animate = true,
    style,
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'bg-background-secondary',
      animate && 'animate-pulse-loading',
      skeletonVariants[variant],
      className
    );

    const inlineStyles = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              ref={index === 0 ? ref : undefined}
              className={cn(
                baseStyles,
                // Make last line shorter for more realistic appearance
                index === lines - 1 && 'w-3/4'
              )}
              style={inlineStyles}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseStyles}
        style={inlineStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Avatar Component
export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        className={cn(avatarSizes[size], className)}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

// Skeleton Card Component (for bounty cards)
export interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  showAvatar?: boolean;
  showTags?: boolean;
  showFooter?: boolean;
}

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ 
    className, 
    showAvatar = true, 
    showTags = true, 
    showFooter = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-primary border border-border-light rounded-bounty-card p-20 space-y-4',
          className
        )}
        {...props}
      >
        {/* Header with avatar and title */}
        <div className="flex items-start space-x-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton variant="text" lines={3} />
        </div>

        {/* Tags */}
        {showTags && (
          <div className="flex space-x-2">
            <Skeleton width={60} height={24} className="rounded-full" />
            <Skeleton width={80} height={24} className="rounded-full" />
            <Skeleton width={70} height={24} className="rounded-full" />
          </div>
        )}

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-between pt-4">
            <Skeleton width={80} height={20} />
            <Skeleton width={100} height={16} />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

// Skeleton List Component
export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
  itemHeight?: number;
  showAvatar?: boolean;
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
};

export const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ 
    className, 
    items = 3, 
    itemHeight = 60, 
    showAvatar = true,
    spacing = 'md',
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-4 bg-background-primary border border-border-light rounded-card"
          >
            {showAvatar && <SkeletonAvatar size="md" />}
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="50%" height={14} />
            </div>
            <Skeleton width={60} height={24} className="rounded-full" />
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = 'SkeletonList';

// Skeleton Table Component
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ 
    className, 
    rows = 5, 
    columns = 4, 
    showHeader = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {/* Header */}
        {showHeader && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant="text" height={20} width="80%" />
            ))}
          </div>
        )}

        {/* Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex}
              className="grid gap-4" 
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  variant="text" 
                  height={16} 
                  width={`${60 + Math.random() * 30}%`} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SkeletonTable.displayName = 'SkeletonTable';