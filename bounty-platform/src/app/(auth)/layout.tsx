import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold text-primary-blue mb-2">
            Bounty Platform
          </h1>
          <p className="text-body text-text-secondary">
            Connect with top freelancers and exciting projects
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-background-primary rounded-card shadow-card border border-border-light p-24">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-body-small text-text-muted">
            © 2025 Bounty Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}