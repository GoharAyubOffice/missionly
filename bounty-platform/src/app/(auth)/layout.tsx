import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Bounty Platform
          </h1>
          <p className="text-gray-600">
            Connect with top freelancers and exciting projects
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Bounty Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}