'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { uploadFile } from '@/app/actions/files';

const businessProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyDescription: z.string().min(10, 'Company description must be at least 10 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  linkedinProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  projectTypes: z.array(z.string()).min(1, 'Please select at least one project type'),
  budgetRange: z.string().min(1, 'Please select a budget range'),
  avatar: z.string().optional(),
  companyLogo: z.string().optional(),
});

export type BusinessProfileData = z.infer<typeof businessProfileSchema>;

interface BusinessProfileFormProps {
  onSubmit: (data: BusinessProfileData) => Promise<void>;
  onAutoSave?: (data: Partial<BusinessProfileData>) => Promise<void>;
  initialData?: Partial<BusinessProfileData>;
  isLoading?: boolean;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Marketing & Advertising',
  'Consulting',
  'Non-profit',
  'Other',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

const PROJECT_TYPES = [
  'Web Development',
  'Mobile App Development',
  'Digital Marketing',
  'Content Creation',
  'Graphic Design',
  'SEO/SEM',
  'Social Media Management',
  'Data Analysis',
  'Consulting',
  'Other',
];

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+',
];

export function BusinessProfileForm({ 
  onSubmit, 
  onAutoSave, 
  initialData, 
  isLoading = false 
}: BusinessProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar || '');
  const [logoUrl, setLogoUrl] = useState<string>(initialData?.companyLogo || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BusinessProfileData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      companyName: initialData?.companyName || '',
      companyDescription: initialData?.companyDescription || '',
      industry: initialData?.industry || '',
      companySize: initialData?.companySize || '',
      website: initialData?.website || '',
      linkedinProfile: initialData?.linkedinProfile || '',
      location: initialData?.location || '',
      phone: initialData?.phone || '',
      projectTypes: initialData?.projectTypes || [],
      budgetRange: initialData?.budgetRange || '',
      avatar: initialData?.avatar || '',
      companyLogo: initialData?.companyLogo || '',
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

  const handleLogoUpload = async (files: File[]) => {
    if (files.length === 0) return [];

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const result = await uploadFile(formData, 'company-logos');
      
      if (result.success && result.url) {
        setLogoUrl(result.url);
        setValue('companyLogo', result.url, { shouldDirty: true });
        return [result.url];
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      return [];
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProjectTypeChange = (projectType: string) => {
    const currentTypes = watchedValues.projectTypes || [];
    const newTypes = currentTypes.includes(projectType)
      ? currentTypes.filter(type => type !== projectType)
      : [...currentTypes, projectType];
    
    setValue('projectTypes', newTypes, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Company Information */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Company Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('companyName')}
            label="Company Name"
            placeholder="Enter your company name"
            error={errors.companyName?.message}
            disabled={isLoading || isSubmitting}
          />

          <Input
            {...register('industry')}
            label="Industry"
            placeholder="Select your industry"
            error={errors.industry?.message}
            disabled={isLoading || isSubmitting}
            list="industries"
          />
        </div>

        <datalist id="industries">
          {INDUSTRIES.map(industry => (
            <option key={industry} value={industry} />
          ))}
        </datalist>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('companySize')}
            label="Company Size"
            placeholder="Select company size"
            error={errors.companySize?.message}
            disabled={isLoading || isSubmitting}
            list="company-sizes"
          />

          <Input
            {...register('location')}
            label="Location"
            placeholder="City, State/Country"
            error={errors.location?.message}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <datalist id="company-sizes">
          {COMPANY_SIZES.map(size => (
            <option key={size} value={size} />
          ))}
        </datalist>

        <div className="space-y-2">
          <label className="block text-label font-medium text-text-primary">
            Company Description
          </label>
          <textarea
            {...register('companyDescription')}
            placeholder="Tell us about your company, what you do, and your goals..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-border rounded-button bg-background-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            disabled={isLoading || isSubmitting}
          />
          {errors.companyDescription && (
            <p className="text-body-small text-error">{errors.companyDescription.message}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('phone')}
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            error={errors.phone?.message}
            disabled={isLoading || isSubmitting}
          />

          <Input
            {...register('website')}
            label="Company Website"
            type="url"
            placeholder="https://yourcompany.com"
            error={errors.website?.message}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <Input
          {...register('linkedinProfile')}
          label="LinkedIn Profile (Optional)"
          type="url"
          placeholder="https://linkedin.com/company/yourcompany"
          error={errors.linkedinProfile?.message}
          disabled={isLoading || isSubmitting}
        />
      </div>

      {/* Project Preferences */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Project Preferences</h3>
        
        <div>
          <label className="block text-label font-medium text-text-primary mb-3">
            Types of Projects You Typically Post
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROJECT_TYPES.map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchedValues.projectTypes?.includes(type) || false}
                  onChange={() => handleProjectTypeChange(type)}
                  className="w-4 h-4 text-primary-blue border-2 border-border rounded focus:ring-2 focus:ring-primary-blue"
                  disabled={isLoading || isSubmitting}
                />
                <span className="text-body text-text-primary">{type}</span>
              </label>
            ))}
          </div>
          {errors.projectTypes && (
            <p className="text-body-small text-error mt-2">{errors.projectTypes.message}</p>
          )}
        </div>

        <Input
          {...register('budgetRange')}
          label="Typical Budget Range"
          placeholder="Select budget range"
          error={errors.budgetRange?.message}
          disabled={isLoading || isSubmitting}
          list="budget-ranges"
        />

        <datalist id="budget-ranges">
          {BUDGET_RANGES.map(range => (
            <option key={range} value={range} />
          ))}
        </datalist>
      </div>

      {/* Profile Images */}
      <div className="space-y-6">
        <h3 className="text-h3 font-bold text-text-primary">Profile Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Company Logo
            </label>
            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              onUpload={handleLogoUpload}
              disabled={isLoading || isSubmitting || uploadingLogo}
              uploadText={uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              dragText="Drop your company logo here"
            />
            {logoUrl && (
              <div className="mt-3">
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  className="w-20 h-20 rounded-button object-contain border-2 border-border bg-white p-2"
                />
              </div>
            )}
          </div>
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
          disabled={isLoading || isSubmitting || uploadingAvatar || uploadingLogo}
        >
          Complete Profile
        </Button>
      </div>
    </form>
  );
}