import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BountyCreationFormData, FormStepId } from '../validators/bounty';

interface BountyCreationState {
  // Form data
  formData: Partial<BountyCreationFormData>;
  
  // Current step
  currentStep: FormStepId;
  
  // Step completion status
  completedSteps: Set<FormStepId>;
  
  // Validation errors for current step
  stepErrors: Record<string, string[]>;
  
  // Loading state
  isSubmitting: boolean;
  
  // Actions
  updateFormData: (data: Partial<BountyCreationFormData>) => void;
  setCurrentStep: (step: FormStepId) => void;
  markStepComplete: (step: FormStepId) => void;
  markStepIncomplete: (step: FormStepId) => void;
  setStepErrors: (errors: Record<string, string[]>) => void;
  clearStepErrors: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
  canNavigateToStep: (step: FormStepId) => boolean;
}

const initialState = {
  formData: {
    tags: [],
    requirements: [],
    skills: [],
    attachments: [],
    featured: false,
    priority: 'MEDIUM' as const,
  },
  currentStep: 'basic-info' as FormStepId,
  completedSteps: new Set<FormStepId>(),
  stepErrors: {},
  isSubmitting: false,
};

export const useBountyCreationStore = create<BountyCreationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      
      setCurrentStep: (step) =>
        set(() => ({
          currentStep: step,
        })),
      
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        })),
      
      markStepIncomplete: (step) =>
        set((state) => {
          const newCompletedSteps = new Set(state.completedSteps);
          newCompletedSteps.delete(step);
          return { completedSteps: newCompletedSteps };
        }),
      
      setStepErrors: (errors) =>
        set(() => ({
          stepErrors: errors,
        })),
      
      clearStepErrors: () =>
        set(() => ({
          stepErrors: {},
        })),
      
      setSubmitting: (isSubmitting) =>
        set(() => ({
          isSubmitting,
        })),
      
      resetForm: () =>
        set(() => ({
          ...initialState,
          completedSteps: new Set(),
        })),
      
      canNavigateToStep: (step) => {
        const state = get();
        const stepOrder: FormStepId[] = ['basic-info', 'requirements', 'budget-timeline', 'additional-settings'];
        const targetIndex = stepOrder.indexOf(step);
        const currentIndex = stepOrder.indexOf(state.currentStep);
        
        // Can always go back to previous steps
        if (targetIndex <= currentIndex) {
          return true;
        }
        
        // Can only go forward if all previous steps are completed
        for (let i = 0; i < targetIndex; i++) {
          if (!state.completedSteps.has(stepOrder[i])) {
            return false;
          }
        }
        
        return true;
      },
    }),
    {
      name: 'bounty-creation-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState?.completedSteps || []),
      }),
    }
  )
);