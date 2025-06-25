-- Storage bucket policies for avatars and uploads

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

-- Service role can manage all storage objects
CREATE POLICY "Service role can manage all storage" ON storage.objects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Bucket management policies
CREATE POLICY "Service role can manage buckets" ON storage.buckets
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users can view bucket info" ON storage.buckets
  FOR SELECT USING (auth.role() = 'authenticated');