import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bounty' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-background-primary border border-border-light shadow-card rounded-card p-24',
  bounty: 'bg-background-primary shadow-bounty-card rounded-bounty-card p-20 transition-shadow duration-standard hover:shadow-bounty-card-hover',
  elevated: 'bg-background-primary border border-border-light shadow-bounty-card-hover rounded-card p-24',
  interactive: 'bg-background-primary border border-border-light shadow-card rounded-card p-24 transition-all duration-standard hover:shadow-bounty-card-hover cursor-pointer',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('text-h3 font-semibold text-text-primary', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-body text-text-secondary', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-16', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-16', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Bounty Card Component (specialized for bounty listings)
export interface BountyCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  description?: string;
  budget: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  skills?: string[];
  deadline?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const statusColors = {
  open: 'text-success bg-success/10',
  in_progress: 'text-accent-orange bg-accent-orange/10', 
  completed: 'text-success bg-success/10',
  cancelled: 'text-error bg-error/10',
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BountyCard = React.forwardRef<HTMLDivElement, BountyCardProps>(
  ({ 
    className, 
    title, 
    description, 
    budget, 
    status, 
    skills = [], 
    deadline, 
    onClick,
    children,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant={onClick ? 'interactive' : 'bounty'}
        className={cn(onClick && 'cursor-pointer', className)}
        onClick={onClick}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-h4 line-clamp-2">{title}</CardTitle>
            <span
              className={cn(
                'px-2 py-1 rounded text-caption font-medium whitespace-nowrap ml-4',
                statusColors[status]
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
          {description && (
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary-blue-pale text-primary-blue text-caption rounded"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="px-2 py-1 bg-background-secondary text-text-muted text-caption rounded">
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          )}
          {children}
        </CardContent>

        <CardFooter className="justify-between">
          <span className="text-button font-semibold text-primary-blue">
            {budget}
          </span>
          {deadline && (
            <span className="text-body-small text-text-muted">
              Due: {deadline}
            </span>
          )}
        </CardFooter>
      </Card>
    );
  }
);

BountyCard.displayName = 'BountyCard';