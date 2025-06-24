'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadFile(formData: FormData, bucketName: string = 'avatars') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to upload files.',
      };
    }

    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided.',
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.',
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return {
        success: false,
        error: 'Failed to upload file. Please try again.',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during file upload.',
    };
  }
}

export async function uploadMultipleFiles(formData: FormData, bucketName: string = 'uploads') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to upload files.',
      };
    }

    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return {
        success: false,
        error: 'No files provided.',
      };
    }

    const results = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB for documents

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        results.push({
          success: false,
          error: `Invalid file type for ${file.name}. Allowed types: images, PDF, and text files.`,
          fileName: file.name,
        });
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        results.push({
          success: false,
          error: `File ${file.name} is too large. Maximum size is 10MB.`,
          fileName: file.name,
        });
        continue;
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

      try {
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Supabase storage error:', error);
          results.push({
            success: false,
            error: `Failed to upload ${file.name}.`,
            fileName: file.name,
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        results.push({
          success: true,
          url: urlData.publicUrl,
          path: data.path,
          fileName: file.name,
        });
      } catch (uploadError) {
        console.error('Individual file upload error:', uploadError);
        results.push({
          success: false,
          error: `Unexpected error uploading ${file.name}.`,
          fileName: file.name,
        });
      }
    }

    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    return {
      success: successfulUploads.length > 0,
      results,
      successCount: successfulUploads.length,
      failCount: failedUploads.length,
      urls: successfulUploads.map(r => r.url).filter((url): url is string => url !== undefined),
    };
  } catch (error) {
    console.error('Multiple file upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during file upload.',
    };
  }
}

export async function deleteFile(filePath: string, bucketName: string = 'uploads') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to delete files.',
      };
    }

    // Check if user owns the file (file path should start with user ID)
    if (!filePath.startsWith(user.id)) {
      return {
        success: false,
        error: 'You can only delete your own files.',
      };
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: 'Failed to delete file.',
      };
    }

    return {
      success: true,
      message: 'File deleted successfully.',
    };
  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during file deletion.',
    };
  }
}

export async function getSignedUploadUrl(fileName: string, bucketName: string = 'uploads') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to get upload URL.',
      };
    }

    // Generate unique filename with user ID prefix
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Create signed URL for upload (expires in 5 minutes)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(uniqueFileName);

    if (error) {
      console.error('Signed URL creation error:', error);
      return {
        success: false,
        error: 'Failed to create upload URL.',
      };
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      path: uniqueFileName,
      token: data.token,
    };
  } catch (error) {
    console.error('Signed URL error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating upload URL.',
    };
  }
}