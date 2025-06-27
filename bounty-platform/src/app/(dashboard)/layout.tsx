'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logoutAction } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';

// Role-based navigation configuration
const getNavigationForRole = (role: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { name: 'Browse Bounties', href: '/bounties', icon: TargetIcon },
    { name: 'Messages', href: '/messages', icon: MessageIcon },
    { name: 'Payments', href: '/payments', icon: PaymentIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  if (role === 'CLIENT') {
    return [
      ...baseNavigation.slice(0, 2),
      { name: 'My Bounties', href: '/my-bounties', icon: BriefcaseIcon },
      { name: 'Analytics', href: '/analytics', icon: ChartIcon },
      ...baseNavigation.slice(2),
    ];
  } else if (role === 'FREELANCER') {
    return [
      ...baseNavigation.slice(0, 2),
      { name: 'My Applications', href: '/applications', icon: ApplicationIcon },
      { name: 'Portfolio', href: '/portfolio', icon: PortfolioIcon },
      ...baseNavigation.slice(2),
    ];
  }

  return baseNavigation;
};

// Modern SVG Icons
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const PaymentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
  </svg>
);

const ApplicationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PortfolioIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      router.push('/');
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.user_metadata?.role || 'CLIENT';
  const navigation = getNavigationForRole(userRole);
  
  // Animation variants
  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div 
              className="relative flex-1 flex flex-col max-w-xs w-full"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <motion.button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 text-white hover:bg-white/10 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <SidebarContent user={user} onLogout={handleLogout} navigation={navigation} pathname={pathname} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div 
        className="hidden md:flex md:flex-shrink-0"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1" style={{ backgroundColor: 'var(--color-background-primary)' }}>
            <SidebarContent user={user} onLogout={handleLogout} navigation={navigation} pathname={pathname} />
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <motion.div 
          className="relative z-10 flex-shrink-0 flex h-18 border-b shadow-sm"
          style={{ 
            backgroundColor: 'var(--color-background-primary)', 
            borderColor: 'var(--color-border-light)'
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Mobile menu button */}
          <motion.button
            type="button"
            className="px-4 border-r text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset md:hidden hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border-light)' }}
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </motion.button>

          {/* Header content */}
          <div className="flex-1 px-6 flex justify-between items-center">
            {/* Search */}
            <div className="flex-1 flex justify-center lg:justify-start">
              <div className="w-full max-w-lg lg:max-w-md">
                <motion.div 
                  className="relative"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    className="search-input block w-full pl-12 pr-4 py-3 border rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{
                      backgroundColor: 'var(--color-background-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Search bounties, projects, or messages..."
                    type="search"
                  />
                </motion.div>
              </div>
            </div>

            {/* Right side - notifications and user menu */}
            <div className="ml-6 flex items-center space-x-4">
              {/* Notifications */}
              <motion.button 
                className="relative p-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
                style={{ color: 'var(--color-text-secondary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.2-1.6A2 2 0 0118 13.4V8a4 4 0 10-8 0v5.4a2 2 0 001.2 1.8L15 17zM15 17v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification badge */}
                <motion.div 
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent-orange)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </motion.button>

              {/* User menu */}
              <motion.div 
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-secondary-blue-light) 100%)` 
                  }}
                >
                  {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{userName}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {userRole === 'CLIENT' ? 'Business' : 'Freelancer'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main content area */}
        <main 
          className="flex-1 relative overflow-y-auto focus:outline-none"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            key={pathname}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  user, 
  onLogout, 
  navigation, 
  pathname 
}: { 
  user: any; 
  onLogout: () => void; 
  navigation: any[];
  pathname: string;
}) {
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.user_metadata?.role || 'CLIENT';

  return (
    <>
      {/* Logo */}
      <motion.div 
        className="flex items-center h-18 flex-shrink-0 px-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--color-primary-blue) 0%, #154360 100%)`
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Missionly
            </h1>
            <p className="text-xs text-white/70 font-medium">
              Performance Marketing
            </p>
          </div>
        </div>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12 translate-x-full" />
      </motion.div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <motion.a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive 
                    ? 'text-white shadow-lg' 
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-blue)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-primary)'
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: isActive ? 0 : 4 }}
              >
                <item.icon className={`mr-4 h-5 w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* User section */}
        <motion.div 
          className="flex-shrink-0 border-t p-4 m-4 rounded-xl"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border-light)'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-secondary-blue-light) 100%)`
                }}
              >
                {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {userName}
                </p>
                <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {userRole === 'CLIENT' ? 'Business Account' : 'Freelancer Account'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              title="Logout"
              whileHover={{ scale: 1.1, color: 'var(--color-error)' }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}