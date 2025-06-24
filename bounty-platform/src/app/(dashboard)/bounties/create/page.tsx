'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BountyCreationForm } from '@/components/forms/BountyCreationForm';
import { createBounty } from '@/app/actions/bounties';
import type { BountyCreationFormData } from '@/lib/validators/bounty';

export default function CreateBountyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: BountyCreationFormData) => {
    try {
      setIsLoading(true);
      
      const result = await createBounty(data);
      
      if (result.success && result.bountyId) {
        // Return the result to the form for payment processing
        return {
          success: true,
          bountyId: result.bountyId,
        };
      } else {
        // Handle error case
        console.error('Failed to create bounty:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to create bounty',
        };
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto py-8">
        <BountyCreationForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}