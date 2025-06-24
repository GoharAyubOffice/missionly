'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BountyActions } from './BountyActions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BountyDetailViewProps {
  bounty: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    budget: number;
    deadline?: Date | null;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    featured: boolean;
    tags: string[];
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    assigneeId?: string | null;
    client: {
      id: string;
      name: string | null;
      avatar: string | null;
      reputation: number;
      location: string | null;
      createdAt: Date;
    };
    assignee?: {
      id: string;
      name: string | null;
      avatar: string | null;
      reputation: number;
    } | null;
    applications: Array<{
      id: string;
      coverLetter: string | null;
      proposedBudget: number | null;
      estimatedDays: number | null;
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
      createdAt: Date;
      applicant: {
        id: string;
        name: string | null;
        avatar: string | null;
        reputation: number;
      };
    }>;
    submissions: Array<{
      id: string;
      title: string;
      description: string;
      status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
      createdAt: Date;
      submitter: {
        id: string;
        name: string | null;
        avatar: string | null;
      };
    }>;
    _count: {
      applications: number;
      submissions: number;
    };
  };
  currentUser: {
    id: string;
    role: 'CLIENT' | 'FREELANCER' | 'ADMIN' | 'MODERATOR';
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  } | null;
  className?: string;
}

export function BountyDetailView({ bounty, currentUser, className }: BountyDetailViewProps) {
  const {
    id,
    title,
    description,
    requirements,
    skills,
    budget,
    deadline,
    priority,
    status,
    featured,
    tags,
    attachments,
    createdAt,
    updatedAt,
    client,
    assignee,
    applications,
    submissions,
    _count
  } = bounty;

  const priorityColors = {
    LOW: 'text-success bg-success/10 border-success/20',
    MEDIUM: 'text-primary-blue bg-primary-blue/10 border-primary-blue/20',
    HIGH: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
    URGENT: 'text-error bg-error/10 border-error/20',
  };

  const statusColors = {
    DRAFT: 'text-text-muted bg-border/10 border-border/20',
    OPEN: 'text-success bg-success/10 border-success/20',
    IN_PROGRESS: 'text-primary-blue bg-primary-blue/10 border-primary-blue/20',
    COMPLETED: 'text-text-muted bg-border/10 border-border/20',
    CANCELLED: 'text-error bg-error/10 border-error/20',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const timeUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffMs = new Date(deadline).getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-error' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-accent-orange' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-accent-orange' };
    if (diffDays < 7) return { text: `${diffDays} days left`, color: 'text-text-primary' };
    return { text: `${Math.ceil(diffDays / 7)} weeks left`, color: 'text-text-primary' };
  };

  return (
    <div className={cn('space-y-8', className)}>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full border',
                  priorityColors[priority]
                )}>
                  {priority} Priority
                </span>
                <span className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full border',
                  statusColors[status]
                )}>
                  {status.replace('_', ' ')}
                </span>
                {featured && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-accent-orange text-primary-white">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-success">
                  ${budget.toLocaleString()}
                </div>
                <div className="text-sm text-text-muted">
                  Budget
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-text-primary mb-4">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>Posted {timeAgo(createdAt)}</span>
              {deadline && (
                <>
                  <span>•</span>
                  <span className={timeUntilDeadline(deadline).color}>
                    🕒 {timeUntilDeadline(deadline).text}
                  </span>
                </>
              )}
              <span>•</span>
              <span>{_count.applications} Application{_count.applications !== 1 ? 's' : ''}</span>
              {_count.submissions > 0 && (
                <>
                  <span>•</span>
                  <span>{_count.submissions} Submission{_count.submissions !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Project Description
            </h2>
            <div className="prose prose-sm max-w-none text-text-secondary">
              {description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Project Requirements
            </h2>
            <ul className="space-y-2">
              {requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span className="text-text-secondary leading-relaxed">
                    {requirement}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          {/* Tags */}
          {tags.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-background-secondary border border-border rounded-full text-sm text-text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Attachments
              </h2>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-text-primary flex-1">{attachment}</span>
                    <Button variant="text" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Assignee (if bounty is in progress) */}
          {status === 'IN_PROGRESS' && assignee && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Assigned Freelancer
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-primary-white flex items-center justify-center text-lg font-medium">
                  {assignee.avatar ? (
                    <img 
                      src={assignee.avatar} 
                      alt={assignee.name || 'Assignee'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    assignee.name?.charAt(0).toUpperCase() || 'F'
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-text-primary">
                    {assignee.name || 'Anonymous Freelancer'}
                  </div>
                  <div className="text-sm text-text-muted">
                    ⭐ {assignee.reputation.toFixed(1)} rating
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = `/users/${assignee.id}`}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Applications (if user is owner) */}
          {currentUser?.id === client.id && applications.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  Recent Applications
                </h2>
                <Link href={`/bounties/${id}/applications`}>
                  <Button variant="text" size="sm">
                    View All ({_count.applications}) →
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-blue text-primary-white flex items-center justify-center font-medium">
                      {application.applicant.avatar ? (
                        <img 
                          src={application.applicant.avatar} 
                          alt={application.applicant.name || 'Applicant'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        application.applicant.name?.charAt(0).toUpperCase() || 'A'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">
                        {application.applicant.name || 'Anonymous Freelancer'}
                      </div>
                      <div className="text-sm text-text-muted">
                        ⭐ {application.applicant.reputation.toFixed(1)} • Applied {timeAgo(application.createdAt)}
                      </div>
                      {application.proposedBudget && (
                        <div className="text-sm text-success font-medium">
                          Proposed: ${application.proposedBudget.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      application.status === 'PENDING' && 'bg-accent-orange/10 text-accent-orange',
                      application.status === 'ACCEPTED' && 'bg-success/10 text-success',
                      application.status === 'REJECTED' && 'bg-error/10 text-error'
                    )}>
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <BountyActions 
            bounty={bounty}
            currentUser={currentUser}
          />

          {/* Client info */}
          <Card className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">
              About the Client
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-blue text-primary-white flex items-center justify-center text-lg font-medium flex-shrink-0">
                {client.avatar ? (
                  <img 
                    src={client.avatar} 
                    alt={client.name || 'Client'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  client.name?.charAt(0).toUpperCase() || 'C'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary mb-1">
                  {client.name || 'Anonymous Client'}
                </div>
                <div className="text-sm text-text-muted space-y-1">
                  <div>⭐ {client.reputation.toFixed(1)} rating</div>
                  {client.location && (
                    <div>📍 {client.location}</div>
                  )}
                  <div>📅 Member since {formatDate(client.createdAt)}</div>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4"
              onClick={() => window.location.href = `/users/${client.id}`}
            >
              View Client Profile
            </Button>
          </Card>

          {/* Project details */}
          <Card className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">
              Project Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Budget:</span>
                <span className="font-medium text-success">${budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Priority:</span>
                <span className={cn('font-medium', {
                  'text-success': priority === 'LOW',
                  'text-primary-blue': priority === 'MEDIUM',
                  'text-accent-orange': priority === 'HIGH',
                  'text-error': priority === 'URGENT',
                })}>
                  {priority}
                </span>
              </div>
              {deadline && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Deadline:</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(deadline)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Posted:</span>
                <span className="font-medium text-text-primary">
                  {formatDate(createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Applications:</span>
                <span className="font-medium text-text-primary">
                  {_count.applications}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}