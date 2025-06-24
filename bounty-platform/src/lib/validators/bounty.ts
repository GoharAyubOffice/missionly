import { z } from 'zod';

export const bountyCreationSchema = z.object({
  // Step 1: Basic Information
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  
  // Step 2: Requirements & Skills
  requirements: z
    .array(z.string().min(1))
    .min(1, 'At least one requirement is required')
    .max(20, 'Maximum 20 requirements allowed'),
  skills: z
    .array(z.string())
    .min(1, 'At least one skill is required')
    .max(15, 'Maximum 15 skills allowed'),
  
  // Step 3: Budget & Timeline
  budget: z
    .number()
    .min(10, 'Budget must be at least $10')
    .max(100000, 'Budget must be less than $100,000'),
  deadline: z
    .date()
    .min(new Date(Date.now() + 24 * 60 * 60 * 1000), 'Deadline must be at least 24 hours from now')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    required_error: 'Please select a priority level',
  }),
  
  // Step 4: Additional Settings
  featured: z.boolean().default(false),
  attachments: z.array(z.string()).max(10, 'Maximum 10 attachments allowed').default([]),
});

// Individual step schemas for wizard validation
export const basicInfoSchema = bountyCreationSchema.pick({
  title: true,
  description: true,
  tags: true,
});

export const requirementsSchema = bountyCreationSchema.pick({
  requirements: true,
  skills: true,
});

export const budgetTimelineSchema = bountyCreationSchema.pick({
  budget: true,
  deadline: true,
  priority: true,
});

export const additionalSettingsSchema = bountyCreationSchema.pick({
  featured: true,
  attachments: true,
});

export type BountyCreationFormData = z.infer<typeof bountyCreationSchema>;
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type RequirementsData = z.infer<typeof requirementsSchema>;
export type BudgetTimelineData = z.infer<typeof budgetTimelineSchema>;
export type AdditionalSettingsData = z.infer<typeof additionalSettingsSchema>;

// Form steps configuration
export const FORM_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your project',
    schema: basicInfoSchema,
  },
  {
    id: 'requirements',
    title: 'Requirements & Skills',
    description: 'Define what you need',
    schema: requirementsSchema,
  },
  {
    id: 'budget-timeline',
    title: 'Budget & Timeline',
    description: 'Set your budget and deadline',
    schema: budgetTimelineSchema,
  },
  {
    id: 'additional-settings',
    title: 'Additional Settings',
    description: 'Final details and attachments',
    schema: additionalSettingsSchema,
  },
] as const;

export type FormStepId = typeof FORM_STEPS[number]['id'];