'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EscrowReleaseModal } from '@/components/ui/EscrowReleaseModal';
import { cn } from '@/lib/utils';
import { publishBounty, deleteBounty } from '@/app/actions/bounties';
import { releaseEscrowPayment } from '@/app/actions/stripe';
import { createMessageThread } from '@/app/actions/messages';

interface BountyActionsProps {
  bounty: {
    id: string;
    title: string;
    budget: number;
    status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    clientId: string;
    assigneeId?: string | null;
    assignee?: {
      id: string;
      name: string | null;
      avatar: string | null;
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
      applicantId?: string;
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

export function BountyActions({ bounty, currentUser, className }: BountyActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  const isOwner = currentUser?.id === bounty.clientId;
  const isFreelancer = currentUser?.role === 'FREELANCER';
  const isClient = currentUser?.role === 'CLIENT';
  const isAssignee = currentUser?.id === bounty.assigneeId;
  const hasApplications = bounty._count.applications > 0;
  const hasSubmissions = bounty._count.submissions > 0;

  // Action handlers
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const result = await publishBounty(bounty.id);
      if (result.success) {
        router.refresh();
        setShowPublishModal(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to publish bounty');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteBounty(bounty.id);
      if (result.success) {
        router.push('/bounties');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to delete bounty');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    router.push(`/bounties/${bounty.id}/apply`);
  };

  const handleEdit = () => {
    router.push(`/bounties/${bounty.id}/edit`);
  };

  const handleViewApplications = () => {
    router.push(`/bounties/${bounty.id}/applications`);
  };

  const handleViewSubmissions = () => {
    router.push(`/bounties/${bounty.id}/submissions`);
  };

  const handleMarkComplete = () => {
    router.push(`/bounties/${bounty.id}/complete`);
  };

  const handleManage = () => {
    router.push(`/bounties/${bounty.id}/manage`);
  };

  const handleStartMessage = async () => {
    try {
      const result = await createMessageThread(bounty.id);
      
      if (result.success && result.threadId) {
        router.push(`/messages/${result.threadId}`);
      } else {
        alert(result.error || 'Failed to create message thread');
      }
    } catch (error) {
      console.error('Error creating message thread:', error);
      alert('An unexpected error occurred while creating message thread');
    }
  };

  const handleReleaseEscrow = async () => {
    if (!bounty.assigneeId) {
      alert('No freelancer assigned to this bounty');
      return;
    }

    try {
      const result = await releaseEscrowPayment(bounty.id, bounty.assigneeId);
      
      if (result.success) {
        router.refresh(); // Refresh the page to show updated status
        setShowEscrowModal(false);
      } else {
        alert(result.error || 'Failed to release payment');
      }
    } catch (error) {
      console.error('Error releasing escrow payment:', error);
      alert('An unexpected error occurred while releasing payment');
    }
  };

  // Don't show actions if user is not authenticated
  if (!currentUser) {
    return (
      <div className={cn('bg-background-primary border border-border rounded-lg p-4', className)}>
        <p className="text-text-secondary text-center">
          Please log in to interact with this bounty
        </p>
        <Button 
          variant="primary" 
          className="w-full mt-3"
          onClick={() => router.push('/login')}
        >
          Log In
        </Button>
      </div>
    );
  }

  // Account not active
  if (currentUser.status !== 'ACTIVE') {
    return (
      <div className={cn('bg-background-primary border border-border rounded-lg p-4', className)}>
        <p className="text-text-secondary text-center">
          Your account must be active to interact with bounties
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Owner Actions (Client who created the bounty) */}
      {isOwner && (
        <div className="bg-background-primary border border-border rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-3">Manage Your Bounty</h3>
          <div className="space-y-2">
            {/* Draft status actions */}
            {bounty.status === 'DRAFT' && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowPublishModal(true)}
                  disabled={isLoading}
                >
                  Publish Bounty
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleEdit}
                  disabled={isLoading}
                >
                  Edit Bounty
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isLoading}
                >
                  Delete Bounty
                </Button>
              </>
            )}

            {/* Open status actions */}
            {bounty.status === 'OPEN' && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleViewApplications}
                  disabled={!hasApplications}
                >
                  View Applications ({bounty._count.applications})
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleEdit}
                  disabled={hasApplications}
                >
                  Edit Bounty
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={hasApplications}
                >
                  Cancel Bounty
                </Button>
              </>
            )}

            {/* In progress status actions */}
            {bounty.status === 'IN_PROGRESS' && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleViewSubmissions}
                  disabled={!hasSubmissions}
                >
                  View Submissions ({bounty._count.submissions})
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleManage}
                >
                  Manage Project
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleStartMessage}
                >
                  💬 Message Freelancer
                </Button>
                <Button
                  variant="warning"
                  className="w-full"
                  onClick={() => setShowEscrowModal(true)}
                  disabled={!hasSubmissions}
                >
                  🔓 Release Payment
                </Button>
              </>
            )}

            {/* Completed status */}
            {bounty.status === 'COMPLETED' && (
              <div className="text-center py-2">
                <span className="text-success font-medium">✓ Bounty Completed</span>
              </div>
            )}

            {/* Cancelled status */}
            {bounty.status === 'CANCELLED' && (
              <div className="text-center py-2">
                <span className="text-error font-medium">✗ Bounty Cancelled</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Freelancer Actions (Non-owner) */}
      {isFreelancer && !isOwner && (
        <div className="bg-background-primary border border-border rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-3">
            {isAssignee ? 'Your Assignment' : 'Apply for This Bounty'}
          </h3>
          <div className="space-y-2">
            {/* Open bounty - freelancer can apply */}
            {bounty.status === 'OPEN' && !isAssignee && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleApply}
                  disabled={isLoading}
                >
                  Apply Now
                </Button>
                <p className="text-xs text-text-secondary text-center">
                  Submit your proposal to work on this project
                </p>
              </>
            )}

            {/* User has applied */}
            {bounty.status === 'OPEN' && bounty.applications.some(app => app.applicantId === currentUser.id) && (
              <div className="text-center py-2">
                <span className="text-primary-blue font-medium">
                  ✓ Application Submitted
                </span>
                <p className="text-xs text-text-secondary mt-1">
                  Your application is being reviewed
                </p>
              </div>
            )}

            {/* In progress - assigned to this freelancer */}
            {bounty.status === 'IN_PROGRESS' && isAssignee && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/bounties/${bounty.id}/submit`)}
                >
                  Submit Work
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(`/bounties/${bounty.id}/workspace`)}
                >
                  Project Workspace
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleStartMessage}
                >
                  💬 Message Client
                </Button>
              </>
            )}

            {/* In progress - not assigned to this freelancer */}
            {bounty.status === 'IN_PROGRESS' && !isAssignee && (
              <div className="text-center py-2">
                <span className="text-text-muted font-medium">
                  Project in Progress
                </span>
                <p className="text-xs text-text-secondary mt-1">
                  This bounty has been assigned to another freelancer
                </p>
              </div>
            )}

            {/* Completed bounty */}
            {bounty.status === 'COMPLETED' && (
              <div className="text-center py-2">
                <span className="text-success font-medium">
                  {isAssignee ? '🎉 Congratulations!' : '✓ Bounty Completed'}
                </span>
                <p className="text-xs text-text-secondary mt-1">
                  {isAssignee ? 'You completed this bounty!' : 'This bounty has been completed'}
                </p>
              </div>
            )}

            {/* Cancelled bounty */}
            {bounty.status === 'CANCELLED' && (
              <div className="text-center py-2">
                <span className="text-error font-medium">✗ Bounty Cancelled</span>
              </div>
            )}

            {/* Draft bounty */}
            {bounty.status === 'DRAFT' && (
              <div className="text-center py-2">
                <span className="text-text-muted font-medium">Draft Bounty</span>
                <p className="text-xs text-text-secondary mt-1">
                  This bounty hasn't been published yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Actions (Non-owner client viewing bounty) */}
      {isClient && !isOwner && (
        <div className="bg-background-primary border border-border rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-3">Bounty Information</h3>
          <div className="text-center py-2">
            <span className="text-text-muted">
              This bounty was created by another client
            </span>
            <p className="text-xs text-text-secondary mt-1">
              Only the bounty owner can manage this project
            </p>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      >
        <h2 className="text-xl font-semibold mb-4">Publish Bounty</h2>
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you ready to publish "<strong>{bounty.title}</strong>"? 
            Once published, freelancers will be able to see and apply for your bounty.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowPublishModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              loading={isLoading}
            >
              Publish Bounty
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <h2 className="text-xl font-semibold mb-4">Delete Bounty</h2>
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete "<strong>{bounty.title}</strong>"? 
            This action cannot be undone.
          </p>
          {hasApplications && (
            <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-3">
              <p className="text-accent-orange text-sm font-medium">
                ⚠️ This bounty has {bounty._count.applications} application(s). 
                Deleting it will remove all associated data.
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isLoading}
            >
              Delete Bounty
            </Button>
          </div>
        </div>
      </Modal>

      {/* Escrow Release Confirmation Modal */}
      {bounty.assignee && (
        <EscrowReleaseModal
          isOpen={showEscrowModal}
          onClose={() => setShowEscrowModal(false)}
          onConfirm={handleReleaseEscrow}
          bounty={{
            id: bounty.id,
            title: bounty.title,
            budget: bounty.budget,
            assignee: bounty.assignee,
          }}
        />
      )}
    </div>
  );
}