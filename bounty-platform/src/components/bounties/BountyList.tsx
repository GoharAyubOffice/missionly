'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BountyCard, BountyCardSkeleton } from './BountyCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface BountyListProps {
  bounties?: any[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  filters?: {
    search?: string;
    skills?: string[];
    minBudget?: number;
    maxBudget?: number;
    priority?: string[];
    status?: string[];
    featured?: boolean;
  };
  onLoadMore?: () => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: any) => void;
  onSearchChange?: (search: string) => void;
  onRetry?: () => void;
  className?: string;
}

export function BountyList({
  bounties = [],
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPrevPage = false,
  filters = {},
  onLoadMore,
  onPageChange,
  onFilterChange,
  onSearchChange,
  onRetry,
  className
}: BountyListProps) {

  // Loading state - show skeletons
  if (loading && bounties.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <BountyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && bounties.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  // Empty state
  if (!loading && bounties.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <EmptyState 
          hasFilters={Object.values(filters).some(value => 
            Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== ''
          )}
          onClearFilters={() => onFilterChange?.({})}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="text-text-secondary">
          {loading ? (
            <div className="h-5 w-32 bg-border rounded animate-pulse" />
          ) : (
            <span>
              Showing {bounties.length} of {totalCount} bounties
              {filters.search && (
                <span> for "{filters.search}"</span>
              )}
            </span>
          )}
        </div>
        
        {/* Quick filters */}
        <div className="flex items-center gap-2">
          <FilterButton 
            active={filters.featured === true}
            onClick={() => onFilterChange?.({ ...filters, featured: filters.featured ? undefined : true })}
          >
            ⭐ Featured
          </FilterButton>
          <FilterButton 
            active={filters.priority?.includes('URGENT')}
            onClick={() => {
              const urgentFilter = filters.priority?.includes('URGENT') 
                ? filters.priority.filter(p => p !== 'URGENT')
                : [...(filters.priority || []), 'URGENT'];
              onFilterChange?.({ ...filters, priority: urgentFilter.length > 0 ? urgentFilter : undefined });
            }}
          >
            🔥 Urgent
          </FilterButton>
        </div>
      </div>

      {/* Bounties grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {bounties.map((bounty, index) => (
            <motion.div
              key={bounty.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <BountyCard bounty={bounty} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading more indicator */}
      {loading && bounties.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BountyCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={onPageChange}
          onLoadMore={onLoadMore}
        />
      )}
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Something went wrong
        </h3>
        <p className="text-text-secondary mb-6">
          {error || 'Failed to load bounties. Please try again.'}
        </p>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

// Empty state component  
function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters?: () => void }) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-secondary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No bounties found
          </h3>
          <p className="text-text-secondary mb-6">
            We couldn't find any bounties matching your current filters. Try adjusting your search criteria or clear the filters to see all available bounties.
          </p>
          <div className="flex gap-3 justify-center">
            {onClearFilters && (
              <Button variant="secondary" onClick={onClearFilters}>
                Clear Filters
              </Button>
            )}
            <Button variant="primary" onClick={() => window.location.href = '/bounties'}>
              View All Bounties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-blue/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6H6a2 2 0 00-2 2v6a2 2 0 002 2h2m8-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No bounties yet
        </h3>
        <p className="text-text-secondary mb-6">
          Be the first to create a bounty and start building amazing projects with talented freelancers.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/bounties/create'}>
          Create Your First Bounty
        </Button>
      </div>
    </div>
  );
}

// Filter button component
function FilterButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active?: boolean; 
  onClick?: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-sm rounded-full border transition-all duration-200',
        active 
          ? 'bg-primary-blue text-primary-white border-primary-blue' 
          : 'bg-background-secondary text-text-secondary border-border hover:border-primary-blue hover:text-primary-blue'
      )}
    >
      {children}
    </button>
  );
}

// Pagination controls component
function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onLoadMore
}: {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center space-x-1">
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            Previous
          </Button>
          
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-text-muted">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onPageChange?.(page as number)}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
          
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      </div>
      
      {/* Load more option */}
      {onLoadMore && hasNextPage && (
        <div className="ml-4">
          <Button variant="text" size="sm" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}