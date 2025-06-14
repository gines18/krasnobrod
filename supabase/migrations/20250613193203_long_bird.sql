/*
  # Add image support to posts

  1. New Columns
    - Add `image_url` column to `lost_found_posts` table
    - Add `image_url` column to `job_posts` table  
    - Add `image_url` column to `news_posts` table

  2. Storage
    - Create storage bucket for post images
    - Set up RLS policies for image access

  3. Changes
    - All image columns are optional (nullable)
    - Images stored in Supabase Storage with public access
*/

-- Add image_url columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lost_found_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE lost_found_posts ADD COLUMN image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE job_posts ADD COLUMN image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE news_posts ADD COLUMN image_url text;
  END IF;
END $$;

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);