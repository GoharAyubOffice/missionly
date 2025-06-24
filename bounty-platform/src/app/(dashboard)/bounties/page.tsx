'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BountyList } from '@/components/bounties/BountyList';
import { SearchInput, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getBounties, type BountyFilters, type PaginationOptions } from '@/app/actions/bounties';
import { cn } from '@/lib/utils';

interface BountyDiscoveryState {
  bounties: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function BountiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<BountyDiscoveryState>({
    bounties: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });

  const [showFilters, setShowFilters] = useState(false);

  // Parse filters from URL search params
  const getFiltersFromURL = useCallback((): BountyFilters => {
    const filters: BountyFilters = {};
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    const skills = searchParams.get('skills');
    if (skills) filters.skills = skills.split(',');
    
    const minBudget = searchParams.get('minBudget');
    if (minBudget) filters.minBudget = parseInt(minBudget);
    
    const maxBudget = searchParams.get('maxBudget');
    if (maxBudget) filters.maxBudget = parseInt(maxBudget);
    
    const priority = searchParams.get('priority');
    if (priority) filters.priority = priority.split(',');
    
    const status = searchParams.get('status');
    if (status) filters.status = status.split(',');
    
    const featured = searchParams.get('featured');
    if (featured === 'true') filters.featured = true;
    
    return filters;
  }, [searchParams]);

  // Parse pagination from URL search params
  const getPaginationFromURL = useCallback((): PaginationOptions => {
    const pagination: PaginationOptions = {};
    
    const page = searchParams.get('page');
    if (page) pagination.page = parseInt(page);
    
    const limit = searchParams.get('limit');
    if (limit) pagination.limit = parseInt(limit);
    
    const sortBy = searchParams.get('sortBy');
    if (sortBy) pagination.sortBy = sortBy as any;
    
    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder) pagination.sortOrder = sortOrder as 'asc' | 'desc';
    
    return pagination;
  }, [searchParams]);

  // Update URL with new filters/pagination
  const updateURL = useCallback((filters: BountyFilters, pagination: PaginationOptions) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.skills && filters.skills.length > 0) params.set('skills', filters.skills.join(','));
    if (filters.minBudget !== undefined) params.set('minBudget', filters.minBudget.toString());
    if (filters.maxBudget !== undefined) params.set('maxBudget', filters.maxBudget.toString());
    if (filters.priority && filters.priority.length > 0) params.set('priority', filters.priority.join(','));
    if (filters.status && filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.featured) params.set('featured', 'true');
    
    if (pagination.page && pagination.page > 1) params.set('page', pagination.page.toString());
    if (pagination.limit && pagination.limit !== 12) params.set('limit', pagination.limit.toString());
    if (pagination.sortBy && pagination.sortBy !== 'createdAt') params.set('sortBy', pagination.sortBy);
    if (pagination.sortOrder && pagination.sortOrder !== 'desc') params.set('sortOrder', pagination.sortOrder);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/bounties${newURL}`, { scroll: false });
  }, [router]);

  // Fetch bounties
  const fetchBounties = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      const filters = getFiltersFromURL();
      const pagination = getPaginationFromURL();
      
      const result = await getBounties(filters, pagination);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          bounties: result.data.bounties,
          pagination: result.data.pagination,
          loading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to fetch bounties',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
    }
  }, [getFiltersFromURL, getPaginationFromURL]);

  // Initial load and URL change listener
  useEffect(() => {
    fetchBounties();
  }, [fetchBounties]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: BountyFilters) => {
    const currentPagination = getPaginationFromURL();
    updateURL(newFilters, { ...currentPagination, page: 1 }); // Reset to page 1 when filters change
  }, [getPaginationFromURL, updateURL]);

  // Handle search changes
  const handleSearchChange = useCallback((search: string) => {
    const currentFilters = getFiltersFromURL();
    const currentPagination = getPaginationFromURL();
    handleFilterChange({ ...currentFilters, search: search || undefined });
  }, [getFiltersFromURL, getPaginationFromURL, handleFilterChange]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    const currentFilters = getFiltersFromURL();
    const currentPagination = getPaginationFromURL();
    updateURL(currentFilters, { ...currentPagination, page });
  }, [getFiltersFromURL, getPaginationFromURL, updateURL]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchBounties();
  }, [fetchBounties]);

  const currentFilters = getFiltersFromURL();
  const currentPagination = getPaginationFromURL();

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Discover Bounties</h1>
              <p className="text-text-secondary mt-1">
                Find exciting projects and start earning today
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/bounties/create')}
            >
              Create Bounty
            </Button>
          </div>

          {/* Search and filters */}
          <div className="bg-background-primary border border-border rounded-lg p-6">
            {/* Search bar */}
            <div className="mb-4">
              <SearchInput
                placeholder="Search bounties by title, description, or tags..."
                value={currentFilters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClear={() => handleSearchChange('')}
                className="w-full"
              />
            </div>

            {/* Quick filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <FilterChip
                  label="Featured"
                  active={currentFilters.featured === true}
                  onClick={() => handleFilterChange({
                    ...currentFilters,
                    featured: currentFilters.featured ? undefined : true
                  })}
                />
                {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
                  <FilterChip
                    key={priority}
                    label={priority}
                    active={currentFilters.priority?.includes(priority) || false}
                    onClick={() => {
                      const newPriority = currentFilters.priority?.includes(priority)
                        ? currentFilters.priority.filter(p => p !== priority)
                        : [...(currentFilters.priority || []), priority];
                      handleFilterChange({
                        ...currentFilters,
                        priority: newPriority.length > 0 ? newPriority : undefined
                      });
                    }}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide' : 'Show'} Advanced Filters
                </Button>
                {Object.values(currentFilters).some(value => 
                  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== ''
                ) && (
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => handleFilterChange({})}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Min Budget
                    </label>
                    <Input
                      type="number"
                      placeholder="Min $"
                      value={currentFilters.minBudget || ''}
                      onChange={(e) => handleFilterChange({
                        ...currentFilters,
                        minBudget: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Max Budget
                    </label>
                    <Input
                      type="number"
                      placeholder="Max $"
                      value={currentFilters.maxBudget || ''}
                      onChange={(e) => handleFilterChange({
                        ...currentFilters,
                        maxBudget: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Skills
                    </label>
                    <Input
                      placeholder="e.g., React, Design"
                      value={currentFilters.skills?.join(', ') || ''}
                      onChange={(e) => handleFilterChange({
                        ...currentFilters,
                        skills: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Sort By
                    </label>
                    <select
                      className="w-full h-input px-4 rounded-button border-2 border-border bg-background-primary text-text-primary focus:border-primary-blue focus:outline-none"
                      value={`${currentPagination.sortBy || 'createdAt'}-${currentPagination.sortOrder || 'desc'}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        updateURL(currentFilters, {
                          ...currentPagination,
                          sortBy: sortBy as any,
                          sortOrder: sortOrder as 'asc' | 'desc'
                        });
                      }}
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="budget-desc">Highest Budget</option>
                      <option value="budget-asc">Lowest Budget</option>
                      <option value="deadline-asc">Deadline Soon</option>
                      <option value="title-asc">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bounty list */}
        <BountyList
          bounties={state.bounties}
          loading={state.loading}
          error={state.error}
          totalCount={state.pagination.totalCount}
          currentPage={state.pagination.page}
          totalPages={state.pagination.totalPages}
          hasNextPage={state.pagination.hasNextPage}
          hasPrevPage={state.pagination.hasPrevPage}
          filters={currentFilters}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}

// Filter chip component
function FilterChip({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
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
      {label}
    </button>
  );
}