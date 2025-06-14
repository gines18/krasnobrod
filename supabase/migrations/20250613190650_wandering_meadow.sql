/*
  # Town Community App Database Schema

  1. New Tables
    - `lost_found_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `type` (text, 'lost' or 'found')
      - `location` (text, optional)
      - `contact_info` (text, optional)
      - `image_url` (text, optional)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `job_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `type` (text, 'offer' or 'request')
      - `location` (text, optional)
      - `contact_info` (text, optional)
      - `salary_range` (text, optional)
      - `image_url` (text, optional)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `news_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `author_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own posts
    - Add policies for admin-only news management
    - Add policies for public reading of posts

  3. User Roles
    - User roles managed through auth.users metadata
    - Admin role stored in user_metadata.role = 'admin'
*/

-- Create lost_found_posts table
CREATE TABLE IF NOT EXISTS lost_found_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('lost', 'found')),
  location text,
  contact_info text,
  image_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_posts table
CREATE TABLE IF NOT EXISTS job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('offer', 'request')),
  location text,
  contact_info text,
  salary_range text,
  image_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lost_found_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- Policies for lost_found_posts
CREATE POLICY "Anyone can view lost and found posts"
  ON lost_found_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own lost and found posts"
  ON lost_found_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost and found posts"
  ON lost_found_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost and found posts"
  ON lost_found_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for job_posts
CREATE POLICY "Anyone can view job posts"
  ON job_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own job posts"
  ON job_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job posts"
  ON job_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job posts"
  ON job_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for news_posts
CREATE POLICY "Anyone can view news posts"
  ON news_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create news posts"
  ON news_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
    AND auth.uid() = author_id
  );

CREATE POLICY "Only admins can update news posts"
  ON news_posts
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete news posts"
  ON news_posts
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS lost_found_posts_user_id_idx ON lost_found_posts(user_id);
CREATE INDEX IF NOT EXISTS lost_found_posts_created_at_idx ON lost_found_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS job_posts_user_id_idx ON job_posts(user_id);
CREATE INDEX IF NOT EXISTS job_posts_created_at_idx ON job_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS news_posts_author_id_idx ON news_posts(author_id);
CREATE INDEX IF NOT EXISTS news_posts_created_at_idx ON news_posts(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_lost_found_posts_updated_at 
  BEFORE UPDATE ON lost_found_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_posts_updated_at 
  BEFORE UPDATE ON job_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at 
  BEFORE UPDATE ON news_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();