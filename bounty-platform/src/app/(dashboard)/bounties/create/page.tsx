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
      
      if (result.success) {
        // Redirect to the created bounty or bounty list
        router.push(`/bounties/${result.bountyId}`);
      } else {
        // Handle error case
        console.error('Failed to create bounty:', result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
      // Handle unexpected errors
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