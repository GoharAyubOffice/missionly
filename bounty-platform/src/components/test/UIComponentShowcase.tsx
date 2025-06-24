'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input, SearchInput } from '@/components/ui/Input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  BountyCard 
} from '@/components/ui/Card';
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalContent, 
  ModalFooter 
} from '@/components/ui/Modal';
import { 
  Skeleton, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonList 
} from '@/components/ui/Skeleton';
import { 
  AnimatedWrapper,
  StaggerWrapper,
  InViewAnimation,
  HoverAnimation,
  LoadingAnimation 
} from '@/components/animations/AnimatedWrapper';

export function UIComponentShowcase() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background-secondary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedWrapper animation="slideUp">
          <div className="text-center mb-12">
            <h1 className="text-h1 font-bold text-text-primary mb-4">
              UI Component Showcase
            </h1>
            <p className="text-body-large text-text-secondary">
              Complete design system with animations and accessibility
            </p>
          </div>
        </AnimatedWrapper>

        {/* Button Components */}
        <InViewAnimation>
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>
                Interactive buttons with hover animations and loading states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button Variants */}
              <div>
                <h4 className="text-h4 mb-4">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="text">Text Button</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h4 className="text-h4 mb-4">Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h4 className="text-h4 mb-4">States</h4>
                <div className="flex flex-wrap gap-4">
                  <Button loading={loading} onClick={handleLoadingTest}>
                    {loading ? 'Loading...' : 'Test Loading'}
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="primary" onClick={() => setModalOpen(true)}>
                    Open Modal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </InViewAnimation>

        {/* Input Components */}
        <InViewAnimation>
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
              <CardDescription>
                Form inputs with validation and accessibility features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Standard Input"
                  placeholder="Enter your name"
                  helperText="This is a helper text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="Input with Error"
                  placeholder="This has an error"
                  error="This field is required"
                />
                <SearchInput
                  placeholder="Search bounties..."
                  label="Search Input"
                />
                <Input
                  label="Disabled Input"
                  placeholder="Disabled input"
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </InViewAnimation>

        {/* Card Components */}
        <InViewAnimation>
          <Card>
            <CardHeader>
              <CardTitle>Card Components</CardTitle>
              <CardDescription>
                Flexible card layouts with composition pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Card */}
                <Card variant="interactive">
                  <CardHeader>
                    <CardTitle as="h4">Interactive Card</CardTitle>
                    <CardDescription>
                      This card has hover effects and is clickable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body text-text-secondary">
                      Card content goes here with some example text.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                {/* Bounty Card */}
                <BountyCard
                  title="Full-Stack Web Application"
                  description="Build a modern web application using React and Node.js with user authentication and payment integration."
                  budget="$2,500 USD"
                  status="open"
                  skills={['React', 'Node.js', 'TypeScript', 'PostgreSQL']}
                  deadline="Dec 31, 2024"
                  onClick={() => console.log('Bounty clicked')}
                >
                  <div>Test bounty card content</div>
                </BountyCard>
              </div>
            </CardContent>
          </Card>
        </InViewAnimation>

        {/* Skeleton Components */}
        <InViewAnimation>
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Components</CardTitle>
              <CardDescription>
                Loading placeholders with pulse animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-h4">Basic Skeletons</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <SkeletonAvatar size="md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                    <Skeleton variant="rectangular" height={100} />
                    <Skeleton variant="text" lines={3} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-h4">Skeleton Card</h4>
                  <SkeletonCard />
                </div>
              </div>
            </CardContent>
          </Card>
        </InViewAnimation>

        {/* Animation Components */}
        <InViewAnimation>
          <Card>
            <CardHeader>
              <CardTitle>Animation Components</CardTitle>
              <CardDescription>
                Various animation patterns and micro-interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Stagger Animation */}
                <div>
                  <h4 className="text-h4 mb-4">Stagger Animation</h4>
                  <StaggerWrapper staggerDelay={0.1}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-primary-blue text-primary-white p-4 rounded-card mb-3"
                      >
                        Item {i + 1}
                      </div>
                    ))}
                  </StaggerWrapper>
                </div>

                {/* Hover Animations */}
                <div>
                  <h4 className="text-h4 mb-4">Hover Animations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <HoverAnimation scale={1.05}>
                      <div className="bg-success text-primary-white p-4 rounded-card text-center">
                        Scale Hover
                      </div>
                    </HoverAnimation>
                    <HoverAnimation y={-5}>
                      <div className="bg-accent-orange text-primary-white p-4 rounded-card text-center">
                        Lift Hover
                      </div>
                    </HoverAnimation>
                    <HoverAnimation rotateY={10}>
                      <div className="bg-accent-purple text-primary-white p-4 rounded-card text-center">
                        Rotate Hover
                      </div>
                    </HoverAnimation>
                    <div className="flex items-center justify-center">
                      <LoadingAnimation size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </InViewAnimation>

        {/* Modal Component */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          size="md"
        >
          <ModalHeader>
            <ModalTitle>Example Modal</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <p className="text-body text-text-secondary mb-4">
              This is an example modal with smooth animations and accessibility features.
            </p>
            <Input
              label="Your Name"
              placeholder="Enter your name"
            />
          </ModalContent>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}