import React from 'react';
import { notFound } from 'next/navigation';
import { BountyDetailView } from '@/components/bounties/BountyDetailView';
import { getBountyById, getCurrentUser } from '@/app/actions/bounties';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface BountyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BountyDetailPage({ params }: BountyDetailPageProps) {
  const { id } = params;

  // Fetch bounty and current user data in parallel
  const [bountyResult, userResult] = await Promise.all([
    getBountyById(id),
    getCurrentUser()
  ]);

  // Handle bounty not found
  if (!bountyResult.success || !bountyResult.data) {
    notFound();
  }

  const bounty = bountyResult.data;
  const currentUser = userResult && userResult.success && userResult.data ? userResult.data : null;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Link href="/bounties" className="hover:text-primary-blue transition-colors">
              Bounties
            </Link>
            <span>›</span>
            <span className="text-text-primary font-medium line-clamp-1">
              {bounty.title}
            </span>
          </div>
        </nav>

        {/* Main content */}
        <BountyDetailView 
          bounty={{
            ...bounty,
            budget: Number(bounty.budget),
            applications: bounty.applications.map(app => ({
              ...app,
              proposedBudget: app.proposedBudget !== null ? Number(app.proposedBudget) : null,
            })),
          }}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BountyDetailPageProps) {
  const { id } = params;
  
  const bountyResult = await getBountyById(id);
  
  if (!bountyResult.success || !bountyResult.data) {
    return {
      title: 'Bounty Not Found',
      description: 'The requested bounty could not be found.',
    };
  }

  const bounty = bountyResult.data;
  
  return {
    title: `${bounty.title} - $${bounty.budget.toLocaleString()} | Missionly`,
    description: bounty.description.slice(0, 160) + (bounty.description.length > 160 ? '...' : ''),
    keywords: bounty.tags.concat(bounty.skills).join(', '),
    openGraph: {
      title: bounty.title,
      description: bounty.description.slice(0, 160),
      type: 'website',
      images: [
        {
          url: '/og-bounty.jpg', // You'd want to create this image
          width: 1200,
          height: 630,
          alt: bounty.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: bounty.title,
      description: bounty.description.slice(0, 160),
    },
  };
}