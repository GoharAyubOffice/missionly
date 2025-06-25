'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/Card';
import { 
  AnimatedWrapper,
  InViewAnimation,
  HoverAnimation 
} from '@/components/animations/AnimatedWrapper';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Navigation */}
      <nav className="bg-background-primary border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
              <span className="text-primary-white font-bold text-lg">B</span>
            </div>
            <span className="text-h3 font-bold text-text-primary">BountyPlatform</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="text">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedWrapper animation="slideUp">
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
              Performance-Based
              <br />
              <span className="text-primary-blue">Marketing Platform</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Connect businesses with skilled marketers through verified performance metrics. 
              Pay only for real results: app installs, conversions, leads, and measurable growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=client">
                <Button size="lg" className="w-full sm:w-auto">
                  Post a Bounty
                </Button>
              </Link>
              <Link href="/register?role=freelancer">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Find Work
                </Button>
              </Link>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <InViewAnimation>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                The only platform that guarantees real business ROI through verified performance metrics
              </p>
            </div>
          </InViewAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InViewAnimation>
              <HoverAnimation y={-5}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <CardTitle>Verified Results</CardTitle>
                    <CardDescription>
                      Automated verification through API integrations with Google Analytics, 
                      app stores, and e-commerce platforms
                    </CardDescription>
                  </CardHeader>
                </Card>
              </HoverAnimation>
            </InViewAnimation>

            <InViewAnimation>
              <HoverAnimation y={-5}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <CardTitle>Secure Escrow</CardTitle>
                    <CardDescription>
                      Smart escrow system with milestone-based payments. 
                      Your money is protected until verified results are delivered
                    </CardDescription>
                  </CardHeader>
                </Card>
              </HoverAnimation>
            </InViewAnimation>

            <InViewAnimation>
              <HoverAnimation y={-5}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-accent-orange rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <CardTitle>Real-Time Tracking</CardTitle>
                    <CardDescription>
                      Monitor progress with live dashboards, real-time notifications, 
                      and 6-hour API refresh rates
                    </CardDescription>
                  </CardHeader>
                </Card>
              </HoverAnimation>
            </InViewAnimation>
          </div>
        </div>
      </section>

      {/* Bounty Categories */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <InViewAnimation>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Popular Bounty Categories
              </h2>
              <p className="text-xl text-text-secondary">
                Find the perfect marketing solution for your business
              </p>
            </div>
          </InViewAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "App Marketing",
                description: "Installs, registrations, in-app purchases, user retention",
                icon: "📱",
                color: "bg-primary-blue"
              },
              {
                title: "Website Growth", 
                description: "Traffic, conversions, email signups, form submissions",
                icon: "🌐",
                color: "bg-success"
              },
              {
                title: "E-commerce",
                description: "Product sales, cart additions, checkout completions",
                icon: "🛒",
                color: "bg-accent-orange"
              },
              {
                title: "Lead Generation",
                description: "Qualified leads, demo bookings, trial signups",
                icon: "🎯",
                color: "bg-accent-purple"
              },
              {
                title: "Content Marketing",
                description: "Blog traffic, content engagement, brand mentions",
                icon: "📝",
                color: "bg-warning"
              },
              {
                title: "Local Business",
                description: "Store visits, phone calls, local directory listings",
                icon: "📍",
                color: "bg-error"
              }
            ].map((category, index) => (
              <InViewAnimation key={index}>
                <HoverAnimation scale={1.02}>
                  <Card className="cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                      <h3 className="text-h4 font-semibold text-text-primary mb-2">
                        {category.title}
                      </h3>
                      <p className="text-body text-text-secondary">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </HoverAnimation>
              </InViewAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary-blue">
        <div className="max-w-4xl mx-auto text-center">
          <InViewAnimation>
            <h2 className="text-4xl font-bold text-primary-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-white opacity-90 mb-8">
              Join thousands of businesses and marketers achieving real results
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=client">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  I Need Marketing Help
                </Button>
              </Link>
              <Link href="/register?role=freelancer">
                <Button variant="text" size="lg" className="w-full sm:w-auto text-primary-white border-primary-white hover:bg-primary-white hover:text-primary-blue">
                  I'm a Marketer
                </Button>
              </Link>
            </div>
          </InViewAnimation>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-background-dark">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-text-muted">
            © 2024 BountyPlatform. Performance-based marketing that works.
          </p>
        </div>
      </footer>
    </div>
  );
}