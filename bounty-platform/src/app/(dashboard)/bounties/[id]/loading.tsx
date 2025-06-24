import React from 'react';
import { Card } from '@/components/ui/Card';

export default function BountyDetailLoading() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <nav className="mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-border rounded animate-pulse" />
            <span className="text-text-muted">›</span>
            <div className="h-4 w-48 bg-border rounded animate-pulse" />
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card skeleton */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-24 bg-border rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-border rounded-full animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-24 bg-border rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 bg-border rounded animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-3/4 bg-border rounded animate-pulse mb-4" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-border rounded animate-pulse" />
                <div className="h-4 w-24 bg-border rounded animate-pulse" />
                <div className="h-4 w-32 bg-border rounded animate-pulse" />
              </div>
            </Card>

            {/* Description skeleton */}
            <Card className="p-6">
              <div className="h-6 w-48 bg-border rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-border rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-border rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-border rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-border rounded animate-pulse" />
              </div>
            </Card>

            {/* Requirements skeleton */}
            <Card className="p-6">
              <div className="h-6 w-40 bg-border rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-4 w-4 bg-border rounded animate-pulse mt-1" />
                    <div className="h-4 w-5/6 bg-border rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Skills skeleton */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-border rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-20 bg-border rounded-full animate-pulse" />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {/* Actions skeleton */}
            <Card className="p-4">
              <div className="h-5 w-32 bg-border rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-10 w-full bg-border rounded animate-pulse" />
                <div className="h-10 w-full bg-border rounded animate-pulse" />
                <div className="h-10 w-full bg-border rounded animate-pulse" />
              </div>
            </Card>

            {/* Client info skeleton */}
            <Card className="p-6">
              <div className="h-5 w-32 bg-border rounded animate-pulse mb-4" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-border rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-border rounded animate-pulse" />
                  <div className="h-3 w-20 bg-border rounded animate-pulse" />
                  <div className="h-3 w-32 bg-border rounded animate-pulse" />
                  <div className="h-3 w-28 bg-border rounded animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-full bg-border rounded animate-pulse mt-4" />
            </Card>

            {/* Project details skeleton */}
            <Card className="p-6">
              <div className="h-5 w-28 bg-border rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-16 bg-border rounded animate-pulse" />
                    <div className="h-4 w-20 bg-border rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}