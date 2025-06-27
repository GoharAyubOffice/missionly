'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }
};

const heroVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))'
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-15"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-green), var(--color-accent-orange))'
        }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? 'var(--color-primary-blue)' : 
                           i % 3 === 1 ? 'var(--color-accent-green)' : 
                           'var(--color-accent-orange)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.4
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-lg bg-white/90 border-b' : 'bg-transparent'
      }`}
      style={{
        borderColor: isScrolled ? 'var(--color-border-light)' : 'transparent'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))'
            }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-12 translate-x-full animate-pulse" />
          </motion.div>
          <div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Missionly</span>
            <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Performance Marketing</div>
          </div>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/login" 
              className="px-6 py-2 rounded-xl font-semibold transition-all hover:bg-gray-50"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign In
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/register" 
              className="btn btn-primary px-6 py-3 shadow-lg"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
      <AnimatedBackground />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{ y: backgroundY }}
        >
          <motion.div 
            className="text-center relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 rounded-full border mb-8"
              style={{
                backgroundColor: 'var(--color-secondary-blue-pale)',
                borderColor: 'var(--color-primary-blue)',
                color: 'var(--color-primary-blue)'
              }}
            >
              <motion.div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: 'var(--color-accent-green)' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-sm font-semibold">New: Advanced Performance Analytics</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
              variants={heroVariants}
            >
              Performance-Based
              <br />
              <motion.span 
                style={{
                  background: `linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Marketing Revolution
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
              variants={itemVariants}
            >
              Connect businesses with elite marketers through <strong>verified performance metrics</strong>. 
              Pay only for real results: app installs, conversions, leads, and measurable growth.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/register?role=client" 
                  className="btn btn-primary px-8 py-4 text-lg shadow-2xl"
                  style={{
                    boxShadow: '0 20px 40px rgba(27, 79, 114, 0.3)'
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post a Bounty
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/register?role=freelancer" 
                  className="btn btn-secondary px-8 py-4 text-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Work
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60"
              variants={itemVariants}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>Trusted by leading companies</div>
              {/* Add company logos here */}
            </motion.div>
          </motion.div>
          
          {/* Floating metrics cards */}
          <motion.div 
            className="absolute top-20 right-10 hidden lg:block"
            variants={floatingVariants}
            animate="animate"
          >
            <div 
              className="card p-4 shadow-xl"
              style={{ backgroundColor: 'var(--color-background-primary)' }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Average ROI</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>342%</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-32 left-10 hidden lg:block"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          >
            <div 
              className="card p-4 shadow-xl"
              style={{ backgroundColor: 'var(--color-background-primary)' }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Projects Completed</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary-blue)' }}>12,847</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <FeaturesSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Individual section components with advanced animations
const FeaturesSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Verified Results",
      description: "Automated verification through API integrations with Google Analytics, app stores, and e-commerce platforms",
      color: "var(--color-success)"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Pay for Performance",
      description: "Only pay when measurable business goals are achieved. No upfront costs, no hourly rates, just results.",
      color: "var(--color-primary-blue)"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Expert Marketers",
      description: "Connect with verified performance marketers who specialize in delivering measurable business outcomes.",
      color: "var(--color-accent-purple)"
    }
  ];
  
  return (
    <section 
      ref={ref}
      className="px-6 py-24 relative"
      style={{ backgroundColor: 'var(--color-background-primary)' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Why Choose Missionly?
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The only platform that guarantees real business ROI through verified performance metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div 
                className="card text-center h-full relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl"
                style={{
                  background: 'var(--color-background-primary)',
                  border: '2px solid transparent'
                }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    color: feature.color
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {feature.icon}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ backgroundColor: feature.color }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {feature.description}
                </p>
                
                {/* Animated border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}50)`,
                    opacity: 0
                  }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const steps = [
    {
      number: 1,
      title: "Post Your Challenge",
      description: "Define your marketing goals with specific, measurable targets",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      number: 2,
      title: "Expert Matching",
      description: "AI-powered matching connects you with qualified marketers",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      number: 3,
      title: "Results Delivered",
      description: "Real-time tracking with verified performance metrics",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      number: 4,
      title: "Pay for Success",
      description: "Only pay when your goals are achieved and verified",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];
  
  return (
    <section 
      ref={ref}
      className="px-6 py-24"
      style={{ backgroundColor: 'var(--color-background-secondary)' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            How It Works
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Simple, transparent, and performance-driven process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div 
                className="relative mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))`
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {step.number}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-white"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {step.title}
              </h3>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const stats = [
    { number: "12,847", label: "Projects Completed", prefix: "", suffix: "" },
    { number: "342", label: "Average ROI", prefix: "", suffix: "%" },
    { number: "98.7", label: "Success Rate", prefix: "", suffix: "%" },
    { number: "24", label: "Average Completion", prefix: "", suffix: "h" }
  ];
  
  return (
    <section 
      ref={ref}
      className="px-6 py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))`
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Platform Performance
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Real numbers from real businesses achieving real results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
              >
                {stat.prefix}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 2, delay: index * 0.2 + 0.8 }}
                >
                  {stat.number}
                </motion.span>
                {stat.suffix}
              </motion.div>
              <p className="text-white/80 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <section 
      ref={ref}
      className="px-6 py-24 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-background-primary)' }}
    >
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Ready to Transform Your Marketing?
          </h2>
          <p 
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Join thousands of businesses and marketers already achieving unprecedented results
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/register" 
                className="btn btn-primary px-10 py-4 text-lg shadow-2xl"
                style={{
                  boxShadow: '0 20px 40px rgba(27, 79, 114, 0.3)'
                }}
              >
                Start Your Journey
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/demo" 
                className="btn btn-secondary px-10 py-4 text-lg"
              >
                Watch Demo
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer 
      className="px-6 py-16 relative"
      style={{ backgroundColor: 'var(--color-background-dark)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-blue), var(--color-secondary-blue-light))'
                }}
              >
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Missionly</span>
                <div className="text-sm text-gray-400">Performance Marketing Platform</div>
              </div>
            </motion.div>
            <p className="text-gray-300 leading-relaxed max-w-md">
              Revolutionizing marketing with performance-based partnerships. 
              Connect, create, and convert with verified results.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Missionly. All rights reserved. Built with passion for performance.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Export individual components for reuse
export { FeaturesSection, HowItWorksSection, StatsSection, CTASection, Footer };