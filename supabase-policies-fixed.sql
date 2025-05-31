-- ==========================================
-- Supabase RLS Policies for Photos Table
-- PostgreSQL/Supabase Syntax
-- ==========================================

-- Step 1: Disable RLS temporarily
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Step 2: Clean up existing policies
DROP POLICY IF EXISTS "public_read" ON photos;
DROP POLICY IF EXISTS "public_insert" ON photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
DROP POLICY IF EXISTS "Users can insert photos" ON photos;

-- Step 3: Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple policies for public meme gallery
CREATE POLICY "public_read" 
ON photos 
FOR SELECT 
USING (true);

CREATE POLICY "public_insert" 
ON photos 
FOR INSERT 
WITH CHECK (true);

-- Step 5: Grant permissions to roles
GRANT SELECT ON photos TO anon;
GRANT INSERT ON photos TO anon;
GRANT SELECT ON photos TO authenticated;
GRANT INSERT ON photos TO authenticated;

-- ==========================================
-- Alternative: Disable RLS completely
-- If you encounter permission issues, 
-- uncomment the line below:
-- ==========================================
-- ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- Instructions:
-- 1. Copy and paste this entire script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run the script
-- 4. Test your application
-- ==========================================
