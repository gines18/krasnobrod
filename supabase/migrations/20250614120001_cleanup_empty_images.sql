-- Clean up empty images from the storage bucket
DO $$
DECLARE
  empty_object record;
BEGIN
  -- Find and delete empty objects in the post-images bucket
  FOR empty_object IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'post-images'
    AND metadata->>'size' = '0'
  LOOP
    -- Delete the empty object
    DELETE FROM storage.objects
    WHERE bucket_id = 'post-images'
    AND name = empty_object.name;
    
    -- Log the deletion
    RAISE NOTICE 'Deleted empty object: %', empty_object.name;
  END LOOP;
END $$; 