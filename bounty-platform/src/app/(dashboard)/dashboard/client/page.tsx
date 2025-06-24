import React from 'react';

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h1 font-bold text-text-primary mb-2">
          Client Dashboard
        </h1>
        <p className="text-body text-text-secondary">
          Welcome to your business dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
          <h3 className="text-h3 font-semibold text-text-primary mb-2">Active Projects</h3>
          <p className="text-h1 font-bold text-primary-blue">0</p>
        </div>
        
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-6">
          <h3 className="text-h3 font-semibold text-text-primary mb-2">Total Spent</h3>
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
            Post New Project
          </button>
          <button className="bg-secondary-blue-pale text-primary-blue border border-primary-blue px-6 py-3 rounded-button font-semibold hover:bg-blue-50 transition-colors">
            Browse Talent
          </button>
        </div>
      </div>
    </div>
  );
}