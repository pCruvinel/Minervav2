-- Enable RLS on storage.objects (it is usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public SELECT on 'uploads' bucket
CREATE POLICY "Public Access to Uploads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'uploads' );

-- Create policy to allow authenticated INSERT on 'uploads' bucket
CREATE POLICY "Authenticated Insert to Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );

-- Create policy to allow authenticated UPDATE on 'uploads' bucket
CREATE POLICY "Authenticated Update to Uploads"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );

-- Create policy to allow authenticated DELETE on 'uploads' bucket
CREATE POLICY "Authenticated Delete to Uploads"
ON storage.objects FOR DELETE
USING ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );
