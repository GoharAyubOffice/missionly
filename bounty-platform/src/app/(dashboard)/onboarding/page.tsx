'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProfileForm, type BusinessProfileData } from '@/components/forms/BusinessProfileForm';
import { MarketerProfileForm, type MarketerProfileData } from '@/components/forms/MarketerProfileForm';
import { 
  updateBusinessProfile, 
  updateMarketerProfile, 
  autoSaveProfile, 
  getCurrentUser 
} from '@/app/actions/user';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  skills: string[];
  role: 'CLIENT' | 'FREELANCER';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

export default function OnboardingPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const result = await getCurrentUser();
      
      if (result.success && result.user) {
        setUserData(result.user as UserData);
        calculateProgress(result.user as UserData);
      } else {
        setError(result.error || 'Failed to load user data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Load user data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (user: UserData) => {
    const requiredFields = ['name', 'bio', 'location', 'skills'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'skills') {
        return user.skills && user.skills.length > 0;
      }
      return user[field as keyof UserData];
    });
    
    const progressPercentage = (completedFields.length / requiredFields.length) * 100;
    setProgress(progressPercentage);
  };

  const handleBusinessSubmit = async (data: BusinessProfileData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateBusinessProfile(data);
      
      if (result.success) {
        router.push('/dashboard/client?onboarding=complete');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Business profile submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarketerSubmit = async (data: MarketerProfileData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateMarketerProfile(data);
      
      if (result.success) {
        router.push('/dashboard/freelancer?onboarding=complete');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Marketer profile submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSave = async (data: Partial<BusinessProfileData | MarketerProfileData>) => {
    try {
      await autoSaveProfile(data);
      
      // Update progress based on the new data
      if (userData) {
        const updatedUser = { ...userData };
        
        if ('companyName' in data && data.companyName) {
          updatedUser.name = data.companyName;
        }
        if ('companyDescription' in data && data.companyDescription) {
          updatedUser.bio = data.companyDescription;
        }
        if ('bio' in data && data.bio) {
          updatedUser.bio = data.bio;
        }
        if ('location' in data && data.location) {
          updatedUser.location = data.location;
        }
        if ('skills' in data && data.skills) {
          updatedUser.skills = data.skills;
        }
        if ('projectTypes' in data && data.projectTypes) {
          updatedUser.skills = data.projectTypes;
        }
        
        calculateProgress(updatedUser);
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  };

  const getInitialBusinessData = (): Partial<BusinessProfileData> => {
    if (!userData) return {};
    
    return {
      companyName: userData.name || '',
      companyDescription: userData.bio || '',
      location: userData.location || '',
      projectTypes: userData.skills || [],
      avatar: userData.avatar || '',
      website: userData.website || '',
    };
  };

  const getInitialMarketerData = (): Partial<MarketerProfileData> => {
    if (!userData) return {};
    
    return {
      bio: userData.bio || '',
      location: userData.location || '',
      skills: userData.skills || [],
      avatar: userData.avatar || '',
      portfolio: userData.website || '',
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <svg className="animate-spin w-16 h-16 text-primary-blue" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-body text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-error rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-h2 font-bold text-text-primary">Something went wrong</h2>
          <p className="text-body text-error">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-blue text-primary-white px-6 py-3 rounded-button font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold text-text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="text-body text-text-secondary mb-6">
            Help us customize your experience by completing your {userData.role === 'CLIENT' ? 'business' : 'freelancer'} profile
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-small text-text-secondary">Profile Completion</span>
              <span className="text-body-small font-medium text-primary-blue">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-border-light rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-blue to-secondary-blue h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-8">
          {userData.role === 'CLIENT' ? (
            <BusinessProfileForm
              onSubmit={handleBusinessSubmit}
              onAutoSave={handleAutoSave}
              initialData={getInitialBusinessData()}
              isLoading={isSubmitting}
            />
          ) : (
            <MarketerProfileForm
              onSubmit={handleMarketerSubmit}
              onAutoSave={handleAutoSave}
              initialData={getInitialMarketerData()}
              isLoading={isSubmitting}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-body-small text-text-secondary">
            Need help completing your profile?{' '}
            <a href="/support" className="text-primary-blue hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}