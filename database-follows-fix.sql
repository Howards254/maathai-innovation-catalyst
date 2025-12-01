-- Fix follows table and RLS policies
-- Run this in Supabase SQL Editor

-- 1. Ensure follows table exists with proper structure
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- 2. Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON follows;

-- 4. Create proper RLS policies
CREATE POLICY "Anyone can view follows" ON follows 
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows 
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows 
    FOR DELETE USING (auth.uid() = follower_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- 6. Verification
SELECT 'Follows table fixed successfully' as status;

-- Check if table exists and has correct structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'follows'
ORDER BY ordinal_position;