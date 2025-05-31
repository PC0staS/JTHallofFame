-- RLS Policies for the photos table
-- This script should be run in your Supabase SQL editor (PostgreSQL syntax)

-- First, disable RLS temporarily to avoid conflicts
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON photos;
DROP POLICY IF EXISTS "Allow public insert access" ON photos;
DROP POLICY IF EXISTS "Allow users to update own photos" ON photos;
DROP POLICY IF EXISTS "Allow users to delete own photos" ON photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
DROP POLICY IF EXISTS "Users can insert photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

-- Enable RLS on the photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Simple policies for a public meme gallery
CREATE POLICY "public_read" ON photos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON photos FOR INSERT WITH CHECK (true);

-- Grant permissions to anon role
GRANT SELECT ON photos TO anon;
GRANT INSERT ON photos TO anon;

-- Grant permissions to authenticated role
GRANT SELECT ON photos TO authenticated;
GRANT INSERT ON photos TO authenticated;
GRANT UPDATE ON photos TO authenticated;
GRANT DELETE ON photos TO authenticated;

-- If you encounter issues with RLS, you can disable it completely:
-- ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
