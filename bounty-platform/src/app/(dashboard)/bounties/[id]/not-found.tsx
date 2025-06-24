import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function BountyNotFound() {
  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 mx-auto mb-6 bg-error/10 rounded-full flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-error" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          Bounty Not Found
        </h1>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          The bounty you're looking for doesn't exist or may have been removed. 
          It might have been deleted by the client or never existed in the first place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/bounties">
            <Button variant="primary" className="w-full sm:w-auto">
              Browse All Bounties
            </Button>
          </Link>
          <Link href="/bounties/create">
            <Button variant="secondary" className="w-full sm:w-auto">
              Create a Bounty
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-text-muted">
            Need help? <Link href="/support" className="text-primary-blue hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}