'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Mock user data - would come from auth context in real app
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  role: 'client' as const,
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', current: true },
  { name: 'Browse Bounties', href: '/bounties', icon: '🎯' },
  { name: 'My Applications', href: '/applications', icon: '📝' },
  { name: 'My Bounties', href: '/my-bounties', icon: '💼' },
  { name: 'Messages', href: '/messages', icon: '💬' },
  { name: 'Payments', href: '/payments', icon: '💳' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background-secondary">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background-primary border-r border-border-light">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-background-primary border-r border-border-light">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-background-primary border-b border-border-light shadow-sm">
          {/* Mobile menu button */}
          <button
            type="button"
            className="px-4 border-r border-border-light text-text-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          {/* Header content */}
          <div className="flex-1 px-4 flex justify-between items-center">
            {/* Search */}
            <div className="flex-1 flex justify-center lg:justify-start">
              <div className="w-full max-w-lg lg:max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-blue rounded-search bg-background-secondary"
                    placeholder="Search bounties..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            {/* Right side - notifications and user menu */}
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="p-2 text-text-muted hover:text-text-primary transition-colors duration-micro rounded-full hover:bg-background-secondary">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.2-1.6A2 2 0 0118 13.4V8a4 4 0 10-8 0v5.4a2 2 0 001.2 1.8L15 17zM15 17v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-primary-white text-sm font-medium">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-text-primary">{mockUser.name}</p>
                  <p className="text-xs text-text-secondary">{mockUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-blue">
        <h1 className="text-xl font-bold text-primary-white">
          Bounty Platform
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-micro',
                item.current
                  ? 'bg-secondary-blue-pale text-primary-blue'
                  : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 flex border-t border-border-light p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-primary-white text-sm font-medium">
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text-primary">{mockUser.name}</p>
              <p className="text-xs text-text-secondary">{mockUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}