'use client';

import React, { useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  allowedTypes?: string[];
  showPreview?: boolean;
  uploadText?: string;
  dragText?: string;
}

interface FilePreview {
  file: File;
  url: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  uploadedUrl?: string;
  error?: string;
}

export function FileUpload({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  onFileSelect,
  onUpload,
  disabled = false,
  className,
  children,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  uploadText = 'Upload files',
  dragText = 'Drag and drop files here, or click to select',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }
    
    return null;
  }, [maxSize, allowedTypes]);

  const createFilePreview = useCallback((file: File): FilePreview => {
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    return {
      file,
      url,
      progress: 0,
      status: 'pending',
    };
  }, []);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const newPreviews: FilePreview[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
        newPreviews.push(createFilePreview(file));
      } else {
        newPreviews.push({
          ...createFilePreview(file),
          status: 'error',
          error,
        });
      }
    });

    if (!multiple) {
      setFiles(newPreviews.slice(0, 1));
      onFileSelect?.(validFiles.slice(0, 1));
    } else {
      setFiles(prev => [...prev, ...newPreviews]);
      onFileSelect?.(validFiles);
    }
  }, [multiple, validateFile, createFilePreview, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const handleUpload = async () => {
    if (!onUpload || isUploading) return;

    const filesToUpload = files.filter(f => f.status === 'pending').map(f => f.file);
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.status === 'uploading' && f.progress < 90 
            ? { ...f, progress: f.progress + Math.random() * 20 }
            : f
        ));
      }, 200);

      const uploadedUrls = await onUpload(filesToUpload);
      
      clearInterval(progressInterval);

      // Update with final results
      setFiles(prev => {
        let uploadIndex = 0;
        return prev.map(f => {
          if (f.status === 'uploading') {
            const uploadedUrl = uploadedUrls[uploadIndex];
            uploadIndex++;
            return {
              ...f,
              status: uploadedUrl ? 'success' as const : 'error' as const,
              progress: 100,
              uploadedUrl,
              error: uploadedUrl ? undefined : 'Upload failed',
            };
          }
          return f;
        });
      });
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: 'Upload failed' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      const validFiles = newFiles.filter(f => f.status !== 'error').map(f => f.file);
      onFileSelect?.(validFiles);
      return newFiles;
    });
  }, [onFileSelect]);

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const FilePreviewItem = ({ filePreview, index }: { filePreview: FilePreview; index: number }) => (
    <div className="relative bg-background-secondary rounded-card p-4 border border-border-light">
      <div className="flex items-start space-x-3">
        {filePreview.url && (
          <img
            src={filePreview.url}
            alt={filePreview.file.name}
            className="w-16 h-16 object-cover rounded-button flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-body font-medium text-text-primary truncate">
            {filePreview.file.name}
          </h4>
          <p className="text-body-small text-text-secondary">
            {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          
          {filePreview.status === 'uploading' && (
            <div className="mt-2">
              <div className="flex justify-between text-body-small text-text-secondary mb-1">
                <span>Uploading...</span>
                <span>{Math.round(filePreview.progress)}%</span>
              </div>
              <div className="w-full bg-border-light rounded-full h-2">
                <div 
                  className="bg-primary-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${filePreview.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {filePreview.status === 'success' && (
            <div className="flex items-center mt-2 text-body-small text-success">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Upload complete
            </div>
          )}
          
          {filePreview.status === 'error' && (
            <div className="flex items-center mt-2 text-body-small text-error">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {filePreview.error}
            </div>
          )}
        </div>
        
        <button
          onClick={() => removeFile(index)}
          className="text-text-muted hover:text-error transition-colors p-1"
          disabled={disabled || isUploading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-card p-8 text-center transition-all duration-200 cursor-pointer',
          isDragOver 
            ? 'border-primary-blue bg-secondary-blue-pale' 
            : 'border-border-light hover:border-border-focus',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {children || (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-background-secondary rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-body text-text-primary font-medium">
                {dragText}
              </p>
              <p className="text-body-small text-text-secondary mt-1">
                {allowedTypes.map(type => type.split('/')[1]).join(', ')} up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept || allowedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {showPreview && files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-body font-medium text-text-primary">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-3">
            {files.map((filePreview, index) => (
              <FilePreviewItem key={`${filePreview.file.name}-${index}`} filePreview={filePreview} index={index} />
            ))}
          </div>
        </div>
      )}

      {onUpload && files.some(f => f.status === 'pending') && (
        <Button
          onClick={handleUpload}
          loading={isUploading}
          disabled={disabled || isUploading}
          variant="primary"
          className="w-full"
        >
          {uploadText}
        </Button>
      )}
    </div>
  );
}