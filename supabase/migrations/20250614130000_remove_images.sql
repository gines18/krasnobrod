-- Remove image_url columns from all post tables
ALTER TABLE lost_found_posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE job_posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE news_posts DROP COLUMN IF EXISTS image_url;

-- Drop the storage bucket and its policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Delete all objects in the bucket first
DELETE FROM storage.objects WHERE bucket_id = 'post-images';

-- Then delete the bucket
DELETE FROM storage.buckets WHERE id = 'post-images'; 