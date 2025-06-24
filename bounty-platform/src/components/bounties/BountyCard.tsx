'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BountyCardProps {
  bounty: {
    id: string;
    title: string;
    description: string;
    budget: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    featured: boolean;
    tags: string[];
    skills: string[];
    deadline?: Date | null;
    createdAt: Date;
    client: {
      id: string;
      name: string | null;
      avatar: string | null;
      reputation: number;
    };
    _count: {
      applications: number;
    };
  };
  className?: string;
  showQuickActions?: boolean;
}

export function BountyCard({ bounty, className, showQuickActions = true }: BountyCardProps) {
  const {
    id,
    title,
    description,
    budget,
    priority,
    status,
    featured,
    tags,
    skills,
    deadline,
    createdAt,
    client,
    _count
  } = bounty;

  const priorityColors = {
    LOW: 'text-success bg-success/10 border-success/20',
    MEDIUM: 'text-primary-blue bg-primary-blue/10 border-primary-blue/20',
    HIGH: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
    URGENT: 'text-error bg-error/10 border-error/20',
  };

  const statusColors = {
    DRAFT: 'text-text-muted bg-border/10 border-border/20',
    OPEN: 'text-success bg-success/10 border-success/20',
    IN_PROGRESS: 'text-primary-blue bg-primary-blue/10 border-primary-blue/20',
    COMPLETED: 'text-text-muted bg-border/10 border-border/20',
    CANCELLED: 'text-error bg-error/10 border-error/20',
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const timeUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={cn(
        'relative p-6 h-full hover:shadow-lg transition-all duration-200',
        featured && 'ring-2 ring-accent-orange ring-offset-2 bg-gradient-to-br from-accent-orange/5 to-transparent'
      )}>
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full border',
              priorityColors[priority]
            )}>
              {priority}
            </span>
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full border',
              statusColors[status]
            )}>
              {status.replace('_', ' ')}
            </span>
            {featured && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-orange text-primary-white">
                ⭐ Featured
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-success">
              ${budget.toLocaleString()}
            </div>
            <div className="text-xs text-text-muted">
              {_count.applications} {_count.applications === 1 ? 'application' : 'applications'}
            </div>
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <Link href={`/bounties/${id}`}>
            <h3 className="text-lg font-semibold text-text-primary hover:text-primary-blue transition-colors line-clamp-2 mb-2">
              {title}
            </h3>
          </Link>
          <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-background-secondary border border-border rounded-full text-text-primary"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-2 py-1 text-xs bg-background-secondary border border-border rounded-full text-text-muted">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary-blue/10 text-primary-blue rounded-full border border-primary-blue/20"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-primary-blue/10 text-primary-blue rounded-full border border-primary-blue/20">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Client info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-blue text-primary-white flex items-center justify-center text-sm font-medium">
              {client.avatar ? (
                <img 
                  src={client.avatar} 
                  alt={client.name || 'Client'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                client.name?.charAt(0).toUpperCase() || 'C'
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">
                {client.name || 'Anonymous Client'}
              </div>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <span>⭐ {client.reputation.toFixed(1)}</span>
                <span>•</span>
                <span>{timeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline info */}
        {deadline && (
          <div className="mb-4">
            <div className={cn(
              'text-xs px-2 py-1 rounded-full border inline-block',
              new Date(deadline) < new Date() 
                ? 'text-error bg-error/10 border-error/20'
                : new Date(deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                ? 'text-accent-orange bg-accent-orange/10 border-accent-orange/20'
                : 'text-text-muted bg-border/10 border-border/20'
            )}>
              🕒 {timeUntilDeadline(new Date(deadline))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        {showQuickActions && status === 'OPEN' && (
          <div className="flex gap-2 mt-auto">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => window.location.href = `/bounties/${id}`}
            >
              View Details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.href = `/bounties/${id}/apply`}
            >
              Apply
            </Button>
          </div>
        )}

        {!showQuickActions && (
          <div className="mt-auto">
            <Link href={`/bounties/${id}`}>
              <Button variant="text" size="sm" className="p-0 h-auto">
                View Details →
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Skeleton component for loading state
export function BountyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Card className="p-6 h-full">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-border rounded-full animate-pulse" />
            <div className="h-6 w-12 bg-border rounded-full animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-6 w-20 bg-border rounded animate-pulse mb-1" />
            <div className="h-4 w-16 bg-border rounded animate-pulse" />
          </div>
        </div>

        {/* Title and description skeleton */}
        <div className="mb-4">
          <div className="h-6 w-3/4 bg-border rounded animate-pulse mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-border rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-border rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-border rounded animate-pulse" />
          </div>
        </div>

        {/* Skills skeleton */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 bg-border rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Client info skeleton */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="w-8 h-8 bg-border rounded-full animate-pulse" />
          <div>
            <div className="h-4 w-24 bg-border rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-border rounded animate-pulse" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-2">
          <div className="h-8 flex-1 bg-border rounded animate-pulse" />
          <div className="h-8 w-16 bg-border rounded animate-pulse" />
        </div>
      </Card>
    </div>
  );
}