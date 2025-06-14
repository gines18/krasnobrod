/*
  # Add user deletion function

  1. New Functions
    - `delete_user()` - Allows users to delete their own account and associated data
  
  2. Security
    - Function uses RLS and auth.uid() to ensure users can only delete their own account
    - Cascading deletes handle associated data cleanup
*/

-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  -- Check if user is authenticated
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user's posts (foreign key constraints will handle this automatically due to CASCADE)
  -- But we'll be explicit for clarity
  DELETE FROM lost_found_posts WHERE user_id = user_uuid;
  DELETE FROM job_posts WHERE user_id = user_uuid;
  DELETE FROM news_posts WHERE author_id = user_uuid;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;