# Storage Setup Guide

This guide covers how to configure Supabase Storage for file uploads in your bounty platform.

## 📁 Storage Overview

Your platform uses Supabase Storage for:
- **User avatars** (profile pictures)
- **Bounty attachments** (requirements, assets)
- **Application files** (portfolios, proposals)
- **Submission deliverables** (completed work)
- **Message attachments** (communication files)

## 🪣 Storage Buckets Configuration

### Step 1: Create Required Buckets

In your Supabase dashboard, go to **Storage** and create these buckets:

#### 1. Avatars Bucket
```
Name: avatars
Public: ✅ Yes
File size limit: 5MB
Allowed MIME types: image/jpeg,image/png,image/gif,image/webp
```

#### 2. Uploads Bucket
```
Name: uploads  
Public: ✅ Yes
File size limit: 10MB
Allowed MIME types: image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

#### 3. Private Files Bucket (Optional)
```
Name: private-files
Public: ❌ No
File size limit: 50MB
Allowed MIME types: */*
```

### Step 2: Configure Bucket Settings

For each bucket, configure:

1. **File size limits** based on your needs
2. **MIME type restrictions** for security
3. **Public/Private access** as appropriate
4. **CDN caching** for better performance

## 🔒 Storage Policies

### Apply Storage RLS Policies

Run this SQL in your Supabase SQL editor:

```sql
-- Enable RLS on storage objects and buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Uploads bucket policies
CREATE POLICY "Upload files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Private files bucket policies (if using)
CREATE POLICY "Private files are only accessible to owners" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'private-files'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload private files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'private-files' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role can manage all storage objects
CREATE POLICY "Service role can manage all storage" ON storage.objects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Bucket management policies
CREATE POLICY "Service role can manage buckets" ON storage.buckets
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users can view bucket info" ON storage.buckets
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 📤 File Upload Implementation

### Your Current Implementation

Your app already has these file upload functions in `src/app/actions/files.ts`:

1. **`uploadFile()`** - Single file upload
2. **`uploadMultipleFiles()`** - Multiple file upload  
3. **`deleteFile()`** - File deletion
4. **`getSignedUploadUrl()`** - Signed URL for direct uploads

### File Upload Flow

1. **Client selects file(s)**
2. **File validation** (type, size)
3. **Upload to Supabase Storage** with user ID prefix
4. **Get public URL** for the uploaded file
5. **Store URL in database** (if needed)

### File Organization Structure

Files are organized by user ID to ensure security:

```
avatars/
  ├── user-id-1/
  │   ├── timestamp-random.jpg
  │   └── timestamp-random.png
  └── user-id-2/
      └── timestamp-random.jpg

uploads/
  ├── user-id-1/
  │   ├── bounty-assets/
  │   ├── application-files/
  │   └── submissions/
  └── user-id-2/
      └── ...
```

## 🔧 Frontend Integration

### File Upload Component Example

```typescript
// components/FileUpload.tsx
import { useState } from 'react';
import { uploadFile } from '@/app/actions/files';

export function FileUpload({ onUploadComplete, bucketName = 'uploads' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadFile(formData, bucketName);

      if (result.success) {
        onUploadComplete(result.url, result.path);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Avatar Upload Component

```typescript
// components/AvatarUpload.tsx
import { useState } from 'react';
import { uploadFile } from '@/app/actions/files';
import Image from 'next/image';

export function AvatarUpload({ currentAvatar, onAvatarChange }) {
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadFile(formData, 'avatars');

      if (result.success) {
        onAvatarChange(result.url);
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
        {currentAvatar && (
          <Image
            src={currentAvatar}
            alt="Avatar"
            fill
            className="object-cover"
          />
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
        className="hidden"
        id="avatar-upload"
      />
      
      <label
        htmlFor="avatar-upload"
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </label>
    </div>
  );
}
```

## 🖼️ Image Optimization

### Next.js Image Component Integration

For displaying uploaded images, use Next.js Image component with Supabase URLs:

```typescript
// next.config.ts - Add Supabase domain
module.exports = {
  images: {
    domains: [
      'your-project.supabase.co',
      // ... other domains
    ],
  },
};

// Component usage
import Image from 'next/image';

<Image
  src={`https://your-project.supabase.co/storage/v1/object/public/avatars/${imagePath}`}
  alt="User avatar"
  width={100}
  height={100}
  className="rounded-full"
/>
```

### Image Transformations

Supabase Storage supports image transformations:

```typescript
// Get resized image URL
const getResizedImageUrl = (path: string, width: number, height: number) => {
  const baseUrl = `https://your-project.supabase.co/storage/v1/object/public/avatars/${path}`;
  return `${baseUrl}?width=${width}&height=${height}&resize=cover`;
};
```

## 📊 File Management Features

### File Size Validation

```typescript
const validateFileSize = (file: File, maxSizeMB: number = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
```

### File Type Validation

```typescript
const validateFileType = (file: File, allowedTypes: string[]) => {
  return allowedTypes.includes(file.type);
};

// Usage
const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const documentTypes = ['application/pdf', 'text/plain', 'application/msword'];
```

### Progress Tracking

For large files, implement upload progress:

```typescript
const uploadWithProgress = async (file: File, onProgress: (percent: number) => void) => {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${userId}/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  // Note: Supabase doesn't support progress callbacks yet
  // You can implement chunked uploads for progress tracking
};
```

## 🧪 Testing Storage

### Test File Upload

1. **Test via your app:**
   - Try uploading different file types
   - Test file size limits
   - Verify files appear in Storage dashboard

2. **Test via API:**
   ```bash
   curl -X POST \
     'https://your-project.supabase.co/storage/v1/object/avatars/test-file.jpg' \
     -H 'Authorization: Bearer your-access-token' \
     -H 'Content-Type: image/jpeg' \
     --data-binary '@path/to/test-image.jpg'
   ```

### Test Access Policies

1. **Test with authenticated user:**
   - Upload should work
   - Can access own files
   - Cannot access other users' files

2. **Test with unauthenticated user:**
   - Upload should fail
   - Can view public files
   - Cannot access private files

## 🚨 Troubleshooting

### Common Issues

1. **"Access denied" errors:**
   - Check RLS policies are applied
   - Verify user authentication
   - Check file path structure

2. **Files not appearing:**
   - Check bucket names match your code
   - Verify upload was successful
   - Check file permissions

3. **Large file upload failures:**
   - Check file size limits
   - Verify connection stability
   - Consider chunked uploads

### Debug Tips

1. **Check Storage logs:**
   - Go to Logs in Supabase dashboard
   - Filter by Storage operations
   - Look for error messages

2. **Test bucket policies:**
   ```sql
   -- Test if user can access bucket
   SELECT * FROM storage.objects WHERE bucket_id = 'avatars' LIMIT 1;
   ```

3. **Verify file paths:**
   - Ensure user ID prefixes are correct
   - Check for special characters in filenames
   - Verify folder structure

## ✅ Storage Setup Checklist

- [ ] Avatars bucket created and configured
- [ ] Uploads bucket created and configured
- [ ] Private files bucket created (if needed)
- [ ] Storage RLS policies applied
- [ ] File upload functions tested
- [ ] File size limits configured
- [ ] MIME type restrictions set
- [ ] Image domains added to Next.js config
- [ ] File validation implemented
- [ ] Upload progress tracking (if needed)
- [ ] Error handling implemented
- [ ] Access policies tested
- [ ] File deletion functionality tested

Your storage system is now fully configured! 📁