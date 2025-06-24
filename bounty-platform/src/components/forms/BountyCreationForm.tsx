'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBountyCreationStore } from '@/lib/stores/bounty-creation';
import { 
  FORM_STEPS, 
  type BountyCreationFormData, 
  type FormStepId,
  basicInfoSchema,
  requirementsSchema,
  budgetTimelineSchema,
  additionalSettingsSchema,
  bountyCreationSchema
} from '@/lib/validators/bounty';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BountyCreationFormProps {
  onSubmit: (data: BountyCreationFormData) => Promise<void>;
  isLoading?: boolean;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder, maxTags = 10 }) => {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-blue text-primary-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 hover:text-red-200 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        helperText={`${value.length}/${maxTags} tags. Press Enter or comma to add.`}
      />
    </div>
  );
};

interface ListInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  label?: string;
}

const ListInput: React.FC<ListInputProps> = ({ value, onChange, placeholder, maxItems = 20, label }) => {
  const [input, setInput] = useState('');

  const addItem = () => {
    const trimmedItem = input.trim();
    if (trimmedItem && !value.includes(trimmedItem) && value.length < maxItems) {
      onChange([...value, trimmedItem]);
      setInput('');
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addItem}
          disabled={!input.trim() || value.length >= maxItems}
        >
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-3 bg-background-secondary rounded-button"
            >
              <span className="text-text-primary">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-error hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-body-small text-text-secondary">
        {value.length}/{maxItems} {label?.toLowerCase() || 'items'}
      </p>
    </div>
  );
};

const StepIndicator: React.FC<{ currentStep: FormStepId; completedSteps: Set<FormStepId> }> = ({
  currentStep,
  completedSteps
}) => {
  const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {FORM_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isAccessible = index <= currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  {
                    'bg-primary-blue text-primary-white': isActive,
                    'bg-success text-primary-white': isCompleted && !isActive,
                    'bg-border text-text-muted': !isActive && !isCompleted && !isAccessible,
                    'bg-background-secondary border-2 border-primary-blue text-primary-blue': !isActive && !isCompleted && isAccessible,
                  }
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-20',
                  {
                    'text-primary-blue': isActive,
                    'text-success': isCompleted && !isActive,
                    'text-text-muted': !isActive && !isCompleted,
                  }
                )}
              >
                {step.title}
              </span>
            </div>
            {index < FORM_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-4 transition-all duration-200',
                  {
                    'bg-success': index < currentIndex || completedSteps.has(FORM_STEPS[index + 1].id),
                    'bg-border': index >= currentIndex && !completedSteps.has(FORM_STEPS[index + 1].id),
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export function BountyCreationForm({ onSubmit, isLoading = false }: BountyCreationFormProps) {
  const {
    formData,
    currentStep,
    completedSteps,
    stepErrors,
    isSubmitting,
    updateFormData,
    setCurrentStep,
    markStepComplete,
    markStepIncomplete,
    setStepErrors,
    clearStepErrors,
    setSubmitting,
    canNavigateToStep,
  } = useBountyCreationStore();

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
  const currentStepData = FORM_STEPS[currentStepIndex];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<BountyCreationFormData>({
    resolver: zodResolver(currentStepData.schema),
    defaultValues: formData,
    mode: 'onBlur',
  });

  const watchedValues = watch();

  React.useEffect(() => {
    updateFormData(watchedValues);
  }, [watchedValues, updateFormData]);

  const validateCurrentStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      markStepComplete(currentStep);
      clearStepErrors();
      return true;
    } else {
      markStepIncomplete(currentStep);
      return false;
    }
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStepIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(FORM_STEPS[currentStepIndex - 1].id);
    }
  };

  const goToStep = (stepId: FormStepId) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleFormSubmit = async (data: Partial<BountyCreationFormData>) => {
    try {
      setSubmitting(true);
      
      // Validate the entire form
      const fullData = { ...formData, ...data };
      const validatedData = bountyCreationSchema.parse(fullData);
      
      await onSubmit(validatedData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;
  const canProceed = completedSteps.has(currentStep) || Object.keys(errors).length === 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create a New Bounty</h1>
        <p className="text-text-secondary">Follow the steps below to create your bounty and start receiving applications.</p>
      </div>

      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <div className="bg-background-primary border border-border rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{currentStepData.title}</h2>
          <p className="text-text-secondary">{currentStepData.description}</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {currentStep === 'basic-info' && (
                <>
                  <Input
                    {...register('title')}
                    label="Bounty Title"
                    placeholder="e.g., Build a responsive landing page for my startup"
                    error={errors.title?.message}
                    helperText="Create a clear, descriptive title that summarizes your project"
                  />

                  <div>
                    <label className="block text-label font-medium text-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={6}
                      className={cn(
                        'w-full px-4 py-3 border-2 rounded-button bg-background-primary text-text-primary',
                        'focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue',
                        'transition-colors duration-200 resize-vertical',
                        errors.description ? 'border-error' : 'border-border'
                      )}
                      placeholder="Describe your project in detail. Include the goals, scope, and any specific requirements..."
                    />
                    {errors.description && (
                      <p className="text-body-small text-error mt-1">{errors.description.message}</p>
                    )}
                    <p className="text-body-small text-text-secondary mt-1">
                      Provide a comprehensive description to attract the right talent
                    </p>
                  </div>

                  <div>
                    <label className="block text-label font-medium text-text-primary mb-2">
                      Tags
                    </label>
                    <TagInput
                      value={formData.tags || []}
                      onChange={(tags) => setValue('tags', tags)}
                      placeholder="Add relevant tags (e.g., web development, design, marketing)"
                      maxTags={10}
                    />
                    {errors.tags && (
                      <p className="text-body-small text-error mt-1">{errors.tags.message}</p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 'requirements' && (
                <>
                  <div>
                    <label className="block text-label font-medium text-text-primary mb-2">
                      Project Requirements
                    </label>
                    <ListInput
                      value={formData.requirements || []}
                      onChange={(requirements) => setValue('requirements', requirements)}
                      placeholder="Enter a specific requirement"
                      maxItems={20}
                      label="requirements"
                    />
                    {errors.requirements && (
                      <p className="text-body-small text-error mt-1">{errors.requirements.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label font-medium text-text-primary mb-2">
                      Required Skills
                    </label>
                    <TagInput
                      value={formData.skills || []}
                      onChange={(skills) => setValue('skills', skills)}
                      placeholder="Add required skills (e.g., React, Figma, SEO)"
                      maxTags={15}
                    />
                    {errors.skills && (
                      <p className="text-body-small text-error mt-1">{errors.skills.message}</p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 'budget-timeline' && (
                <>
                  <Input
                    {...register('budget', { valueAsNumber: true })}
                    label="Budget (USD)"
                    type="number"
                    min="10"
                    max="100000"
                    step="1"
                    placeholder="1000"
                    error={errors.budget?.message}
                    helperText="Set a fair budget that reflects the scope and complexity of your project"
                    leftIcon={
                      <span className="text-text-muted font-medium">$</span>
                    }
                  />

                  <Input
                    {...register('deadline', { valueAsDate: true })}
                    label="Deadline (Optional)"
                    type="date"
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    error={errors.deadline?.message}
                    helperText="When do you need this project completed?"
                  />

                  <div>
                    <label className="block text-label font-medium text-text-primary mb-3">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
                        <label
                          key={priority}
                          className={cn(
                            'relative flex items-center justify-center p-4 border-2 rounded-button cursor-pointer transition-all duration-200',
                            'hover:border-primary-blue focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2',
                            errors.priority ? 'border-error' : 'border-border'
                          )}
                        >
                          <input
                            {...register('priority')}
                            type="radio"
                            value={priority}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <span className="font-medium text-text-primary">{priority}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.priority && (
                      <p className="text-body-small text-error mt-2">{errors.priority.message}</p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 'additional-settings' && (
                <>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <span className="text-body text-text-primary font-medium">
                        Featured Bounty
                      </span>
                      <p className="text-body-small text-text-secondary mt-1">
                        Make your bounty stand out and get more visibility (additional fee applies)
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-label font-medium text-text-primary mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-button p-6 text-center">
                      <div className="text-text-muted mb-2">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-text-primary font-medium mb-1">Upload project files</p>
                      <p className="text-body-small text-text-secondary">
                        Drag and drop files here, or click to browse (Max 10 files)
                      </p>
                    </div>
                  </div>

                  <div className="bg-background-secondary border border-border rounded-button p-4">
                    <h3 className="font-semibold text-text-primary mb-2">Review Your Bounty</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {formData.title || 'Not set'}</p>
                      <p><span className="font-medium">Budget:</span> ${formData.budget || 0}</p>
                      <p><span className="font-medium">Priority:</span> {formData.priority || 'Not set'}</p>
                      <p><span className="font-medium">Skills:</span> {formData.skills?.join(', ') || 'None'}</p>
                      <p><span className="font-medium">Requirements:</span> {formData.requirements?.length || 0} items</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {!isLastStep ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                  disabled={!canProceed}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="success"
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting || !canProceed}
                >
                  Create Bounty
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}