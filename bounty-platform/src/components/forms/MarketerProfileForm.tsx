'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { uploadFile, uploadMultipleFiles } from '@/app/actions/files';

const marketerProfileSchema = z.object({
  title: z.string().min(5, 'Professional title must be at least 5 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  hourlyRate: z.number().min(5, 'Hourly rate must be at least $5').max(500, 'Hourly rate cannot exceed $500'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
  skills: z.array(z.string()).min(3, 'Please select at least 3 skills'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  portfolio: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  linkedinProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  githubProfile: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  availability: z.string().min(1, 'Please select your availability'),
  preferredProjectTypes: z.array(z.string()).min(1, 'Please select at least one project type'),
  avatar: z.string().optional(),
  portfolioFiles: z.array(z.string()).optional(),
});

export type MarketerProfileData = z.infer<typeof marketerProfileSchema>;

interface MarketerProfileFormProps {
  onSubmit: (data: MarketerProfileData) => Promise<void>;
  onAutoSave?: (data: Partial<MarketerProfileData>) => Promise<void>;
  initialData?: Partial<MarketerProfileData>;
  isLoading?: boolean;
}

const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Intermediate (2-5 years)',
  'Expert (5-10 years)',
  'Senior Expert (10+ years)',
];

const SKILLS = [
  'Digital Marketing',
  'Social Media Marketing',
  'Content Marketing',
  'SEO/SEM',
  'Email Marketing',
  'PPC Advertising',
  'Analytics & Reporting',
  'Marketing Automation',
  'Influencer Marketing',
  'Brand Strategy',
  'Copywriting',
  'Graphic Design',
  'Video Production',
  'Web Development',
  'UX/UI Design',
  'Data Analysis',
  'Project Management',
  'CRM Management',
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Hindi',
  'Other',
];

const AVAILABILITY_OPTIONS = [
  'Full-time (40+ hours/week)',
  'Part-time (20-40 hours/week)',
  'Project-based',
  'As needed (< 20 hours/week)',
];

const PROJECT_TYPES = [
  'Website Development',
  'Mobile App Development',
  'E-commerce Solutions',
  'Digital Marketing Campaigns',
  'Content Creation',
  'SEO Optimization',
  'Social Media Management',
  'Brand Development',
  'Data Analysis',
  'Marketing Automation',
  'Email Marketing',
  'PPC Campaigns',
];

export function MarketerProfileForm({ 
  onSubmit, 
  onAutoSave, 
  initialData, 
  isLoading = false 
}: MarketerProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar || '');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(initialData?.portfolioFiles || []);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MarketerProfileData>({
    resolver: zodResolver(marketerProfileSchema),
    defaultValues: {
      title: initialData?.title || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      hourlyRate: initialData?.hourlyRate || 0,
      experienceLevel: initialData?.experienceLevel || '',
      skills: initialData?.skills || [],
      languages: initialData?.languages || [],
      portfolio: initialData?.portfolio || '',
      linkedinProfile: initialData?.linkedinProfile || '',
      githubProfile: initialData?.githubProfile || '',
      phone: initialData?.phone || '',
      availability: initialData?.availability || '',
      preferredProjectTypes: initialData?.preferredProjectTypes || [],
      avatar: initialData?.avatar || '',
      portfolioFiles: initialData?.portfolioFiles || [],
    },
  });

  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!onAutoSave || !isDirty) return;

    const timeoutId = setTimeout(() => {
      onAutoSave(watchedValues);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [watchedValues, onAutoSave, isDirty]);

  const handleAvatarUpload = async (files: File[]) => {
    if (files.length === 0) return [];

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const result = await uploadFile(formData, 'avatars');
      
      if (result.success && result.url) {
        setAvatarUrl(result.url);
        setValue('avatar', result.url, { shouldDirty: true });
        return [result.url];
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return [];
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePortfolioUpload = async (files: File[]) => {
    if (files.length === 0) return [];

    setUploadingPortfolio(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const result = await uploadMultipleFiles(formData, 'portfolio');
      
      if (result.success && result.urls) {
        const validUrls = result.urls.filter((url): url is string => url !== undefined);
        const newUrls = [...portfolioUrls, ...validUrls];
        setPortfolioUrls(newUrls);
        setValue('portfolioFiles', newUrls, { shouldDirty: true });
        return validUrls;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Portfolio upload error:', error);
      return [];
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleSkillChange = (skill: string) => {
    const currentSkills = watchedValues.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    setValue('skills', newSkills, { shouldDirty: true });
  };

  const handleLanguageChange = (language: string) => {
    const currentLanguages = watchedValues.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language];
    
    setValue('languages', newLanguages, { shouldDirty: true });
  };

  const handleProjectTypeChange = (projectType: string) => {
    const currentTypes = watchedValues.preferredProjectTypes || [];
    const newTypes = currentTypes.includes(projectType)
      ? currentTypes.filter(type => type !== projectType)
      : [...currentTypes, projectType];
    
    setValue('preferredProjectTypes', newTypes, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Professional Information</h3>
        
        <Input
          {...register('title')}
          label="Professional Title"
          placeholder="e.g., Digital Marketing Specialist, SEO Expert, Content Creator"
          error={errors.title?.message}
          disabled={isLoading || isSubmitting}
        />

        <div className="space-y-2">
          <label className="block text-label font-medium text-text-primary">
            Professional Bio
          </label>
          <textarea
            {...register('bio')}
            placeholder="Tell clients about your experience, expertise, and what makes you unique..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-border rounded-button bg-background-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            disabled={isLoading || isSubmitting}
          />
          {errors.bio && (
            <p className="text-body-small text-error">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('location')}
            label="Location"
            placeholder="City, State/Country"
            error={errors.location?.message}
            disabled={isLoading || isSubmitting}
          />

          <Input
            {...register('hourlyRate', { valueAsNumber: true })}
            label="Hourly Rate (USD)"
            type="number"
            min="5"
            max="500"
            placeholder="50"
            error={errors.hourlyRate?.message}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <Input
          {...register('experienceLevel')}
          label="Experience Level"
          placeholder="Select your experience level"
          error={errors.experienceLevel?.message}
          disabled={isLoading || isSubmitting}
          list="experience-levels"
        />

        <datalist id="experience-levels">
          {EXPERIENCE_LEVELS.map(level => (
            <option key={level} value={level} />
          ))}
        </datalist>
      </div>

      {/* Skills & Expertise */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Skills & Expertise</h3>
        
        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Skills (Select at least 3)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SKILLS.map(skill => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchedValues.skills?.includes(skill) || false}
                  onChange={() => handleSkillChange(skill)}
                  className="w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue"
                  disabled={isLoading || isSubmitting}
                />
                <span className="text-body text-text-primary">{skill}</span>
              </label>
            ))}
          </div>
          {errors.skills && (
            <p className="text-body-small text-error mt-2">{errors.skills.message}</p>
          )}
        </div>

        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Languages
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {LANGUAGES.map(language => (
              <label key={language} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchedValues.languages?.includes(language) || false}
                  onChange={() => handleLanguageChange(language)}
                  className="w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue"
                  disabled={isLoading || isSubmitting}
                />
                <span className="text-body text-text-primary">{language}</span>
              </label>
            ))}
          </div>
          {errors.languages && (
            <p className="text-body-small text-error mt-2">{errors.languages.message}</p>
          )}
        </div>
      </div>

      {/* Contact & Portfolio */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Contact & Portfolio</h3>
        
        <Input
          {...register('phone')}
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          disabled={isLoading || isSubmitting}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('portfolio')}
            label="Portfolio Website"
            type="url"
            placeholder="https://yourportfolio.com"
            error={errors.portfolio?.message}
            disabled={isLoading || isSubmitting}
          />

          <Input
            {...register('linkedinProfile')}
            label="LinkedIn Profile"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            error={errors.linkedinProfile?.message}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <Input
          {...register('githubProfile')}
          label="GitHub Profile (Optional)"
          type="url"
          placeholder="https://github.com/yourusername"
          error={errors.githubProfile?.message}
          disabled={isLoading || isSubmitting}
        />
      </div>

      {/* Work Preferences */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Work Preferences</h3>
        
        <Input
          {...register('availability')}
          label="Availability"
          placeholder="Select your availability"
          error={errors.availability?.message}
          disabled={isLoading || isSubmitting}
          list="availability-options"
        />

        <datalist id="availability-options">
          {AVAILABILITY_OPTIONS.map(option => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Preferred Project Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROJECT_TYPES.map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchedValues.preferredProjectTypes?.includes(type) || false}
                  onChange={() => handleProjectTypeChange(type)}
                  className="w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue"
                  disabled={isLoading || isSubmitting}
                />
                <span className="text-body text-text-primary">{type}</span>
              </label>
            ))}
          </div>
          {errors.preferredProjectTypes && (
            <p className="text-body-small text-error mt-2">{errors.preferredProjectTypes.message}</p>
          )}
        </div>
      </div>

      {/* Profile & Portfolio Files */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Profile & Portfolio</h3>
        
        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Profile Avatar
          </label>
          <FileUpload
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
            onUpload={handleAvatarUpload}
            disabled={isLoading || isSubmitting || uploadingAvatar}
            uploadText={uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            dragText="Drop your profile photo here"
          />
          {avatarUrl && (
            <div className="mt-3">
              <img 
                src={avatarUrl} 
                alt="Avatar preview" 
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Portfolio Files (Optional)
          </label>
          <p className="text-body-small text-text-secondary mb-3">
            Upload work samples, case studies, or other portfolio materials
          </p>
          <FileUpload
            accept="image/*,.pdf,.doc,.docx"
            maxSize={10 * 1024 * 1024}
            multiple
            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            onUpload={handlePortfolioUpload}
            disabled={isLoading || isSubmitting || uploadingPortfolio}
            uploadText={uploadingPortfolio ? 'Uploading...' : 'Upload Portfolio Files'}
            dragText="Drop portfolio files here (images, PDFs, documents)"
          />
          {portfolioUrls.length > 0 && (
            <div className="mt-3">
              <p className="text-body-small text-text-secondary mb-2">
                {portfolioUrls.length} portfolio file(s) uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border-light">
        <div className="text-body-small text-text-secondary">
          {onAutoSave && isDirty && 'Changes will be auto-saved...'}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting || uploadingAvatar || uploadingPortfolio}
        >
          Complete Profile
        </Button>
      </div>
    </form>
  );
}