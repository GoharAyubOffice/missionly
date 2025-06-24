'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EscrowReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bounty: {
    id: string;
    title: string;
    budget: number;
    assignee: {
      id: string;
      name: string | null;
      avatar: string | null;
    } | null;
  };
  className?: string;
}

export function EscrowReleaseModal({
  isOpen,
  onClose,
  onConfirm,
  bounty,
  className
}: EscrowReleaseModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  
  const requiredConfirmationText = 'RELEASE PAYMENT';
  const isConfirmationValid = confirmationText === requiredConfirmationText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error releasing payment:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      setConfirmationText('');
      onClose();
    }
  };

  // Calculate platform fee (3%)
  const platformFee = bounty.budget * 0.03;
  const freelancerAmount = bounty.budget - platformFee;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Release Escrow Payment"
      className={className}
    >
      <div className="space-y-6">
        {/* Warning Header */}
        <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-accent-orange font-semibold mb-1">
                Critical Action Required
              </h3>
              <p className="text-accent-orange/80 text-sm">
                Once released, this payment cannot be reversed. Please ensure the work has been completed to your satisfaction.
              </p>
            </div>
          </div>
        </div>

        {/* Bounty Details */}
        <div className="bg-background-secondary border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text-primary mb-3">Payment Details</h4>
          <div className="space-y-3">
            <div>
              <span className="text-text-muted text-sm">Bounty:</span>
              <p className="font-medium text-text-primary line-clamp-2">{bounty.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Total Budget:</span>
                <p className="font-semibold text-text-primary">${bounty.budget.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">Platform Fee (3%):</span>
                <p className="font-semibold text-text-primary">-${platformFee.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border">
              <span className="text-text-muted text-sm">Freelancer Receives:</span>
              <p className="text-xl font-bold text-success">${freelancerAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Freelancer Info */}
        {bounty.assignee && (
          <div className="bg-background-secondary border border-border rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-3">Payment Recipient</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-blue text-primary-white flex items-center justify-center font-medium">
                {bounty.assignee.avatar ? (
                  <img 
                    src={bounty.assignee.avatar} 
                    alt={bounty.assignee.name || 'Freelancer'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  bounty.assignee.name?.charAt(0).toUpperCase() || 'F'
                )}
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {bounty.assignee.name || 'Anonymous Freelancer'}
                </p>
                <p className="text-text-muted text-sm">
                  Will receive ${freelancerAmount.toFixed(2)} within 2-7 business days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="bg-error/5 border border-error/20 rounded-lg p-4">
          <h4 className="font-semibold text-error mb-3">Confirmation Required</h4>
          <p className="text-text-secondary text-sm mb-3">
            To proceed with this irreversible action, please type{' '}
            <span className="font-mono font-bold text-error">{requiredConfirmationText}</span>{' '}
            in the field below:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
            placeholder={requiredConfirmationText}
            className={cn(
              'w-full px-3 py-2 border-2 rounded-button bg-background-primary text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-error focus:border-error',
              'transition-colors duration-200 font-mono',
              isConfirmationValid 
                ? 'border-success text-success' 
                : confirmationText 
                ? 'border-error' 
                : 'border-border'
            )}
            disabled={isConfirming}
          />
          {confirmationText && !isConfirmationValid && (
            <p className="text-error text-xs mt-1">
              Please type exactly: {requiredConfirmationText}
            </p>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-background-secondary border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text-primary mb-3">Before Releasing Payment</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-0.5 w-4 h-4 text-primary-blue border-border rounded focus:ring-primary-blue" 
                disabled={isConfirming}
              />
              <span className="text-text-secondary">
                I have reviewed the submitted work and it meets all requirements
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-0.5 w-4 h-4 text-primary-blue border-border rounded focus:ring-primary-blue" 
                disabled={isConfirming}
              />
              <span className="text-text-secondary">
                I understand this payment cannot be reversed once released
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-0.5 w-4 h-4 text-primary-blue border-border rounded focus:ring-primary-blue" 
                disabled={isConfirming}
              />
              <span className="text-text-secondary">
                I am satisfied with the completed work
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isConfirming}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            loading={isConfirming}
            disabled={!isConfirmationValid || isConfirming}
            className="flex-1"
          >
            {isConfirming ? 'Releasing Payment...' : 'Release Payment'}
          </Button>
        </div>

        {/* Final Warning */}
        <div className="text-center">
          <p className="text-xs text-text-muted">
            By releasing this payment, you acknowledge that the work has been completed 
            satisfactorily and agree to transfer the funds to the freelancer.
          </p>
        </div>
      </div>
    </Modal>
  );
}