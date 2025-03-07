/*
  # Create storage bucket for images

  1. Storage
    - Create a new storage bucket for user images
  2. Security
    - Enable RLS on the storage bucket
    - Add policy for authenticated users to upload their own images
    - Add policy for public access to view images
*/

-- Create a new storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Enable RLS
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to view images
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');