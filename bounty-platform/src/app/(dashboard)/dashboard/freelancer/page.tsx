'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function FreelancerDashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('onboarding') === 'complete') {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 10000); // Hide after 10 seconds
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="bg-success-pale border border-success rounded-card p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-h3 font-bold text-success">Welcome to Bounty Platform!</h3>
              <p className="text-body text-success">
                Your profile is now complete. You can start browsing projects and applying for opportunities.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-h1 font-bold text-text-primary mb-2">
          Freelancer Dashboard
        </h1>
        <p className="text-body text-text-secondary">
          Welcome to your freelancer dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
          <h3 className="text-h3 font-semibold text-text-primary mb-2">Active Projects</h3>
          <p className="text-h1 font-bold text-primary-blue">0</p>
        </div>
        
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
          <h3 className="text-h3 font-semibold text-text-primary mb-2">Total Earned</h3>
          <p className="text-h1 font-bold text-success">$0.00</p>
        </div>
        
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
          <h3 className="text-h3 font-semibold text-text-primary mb-2">Applications</h3>
          <p className="text-h1 font-bold text-accent-orange">0</p>
        </div>
      </div>

      <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
        <h2 className="text-h2 font-bold text-text-primary mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary-blue text-primary-white px-6 py-3 rounded-button font-semibold hover:bg-blue-700 transition-colors">
            Browse Projects
          </button>
          <button className="bg-secondary-blue-pale text-primary-blue border border-primary-blue px-6 py-3 rounded-button font-semibold hover:bg-blue-50 transition-colors">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}