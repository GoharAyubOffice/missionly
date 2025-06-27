'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BountyCreationForm } from '@/components/forms/BountyCreationForm';
import { createBounty } from '@/app/actions/bounties';
import type { BountyCreationFormData } from '@/lib/validators/bounty';
import { useBountyCreationStore } from '@/lib/stores/bounty-creation';

export default function CreateBountyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDraftOption, setShowDraftOption] = React.useState(false);
  const { resetForm, updateFormData, setCurrentStep } = useBountyCreationStore();

  // Check for draft and reset form when component mounts
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const draftData = localStorage.getItem('bounty-draft');
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          // Check if draft is less than 24 hours old
          const isRecentDraft = (Date.now() - draft.timestamp) < (24 * 60 * 60 * 1000);
          if (isRecentDraft && draft.data) {
            setShowDraftOption(true);
            return; // Don't reset if we have a valid draft
          }
        } catch (error) {
          console.error('Error parsing draft data:', error);
        }
      }
      
      // Reset form and clear old data
      resetForm();
      localStorage.removeItem('bounty-creation-form');
      localStorage.removeItem('bounty-draft');
    }
  }, [resetForm, updateFormData, setCurrentStep]);

  const loadDraft = () => {
    if (typeof window !== 'undefined') {
      const draftData = localStorage.getItem('bounty-draft');
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          updateFormData(draft.data);
          setCurrentStep(draft.step);
          setShowDraftOption(false);
        } catch (error) {
          console.error('Error loading draft:', error);
          alert('Failed to load draft. Starting fresh.');
          startFresh();
        }
      }
    }
  };

  const startFresh = () => {
    resetForm();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bounty-draft');
    }
    setShowDraftOption(false);
  };

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
        {showDraftOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background-primary p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Draft Found
              </h2>
              <p className="text-text-secondary mb-6">
                We found a saved draft from your previous session. Would you like to continue where you left off or start fresh?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={loadDraft}
                  className="flex-1 bg-primary-blue text-primary-white px-4 py-2 rounded-button hover:bg-[#154360] transition-colors"
                >
                  Continue Draft
                </button>
                <button
                  onClick={startFresh}
                  className="flex-1 bg-transparent text-primary-blue border-2 border-primary-blue px-4 py-2 rounded-button hover:bg-secondary-blue-pale transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}
        
        <BountyCreationForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}