-- Step 2: Social Tables
-- Run this after Step 1

-- Social tables
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on follows" ON follows;
DROP POLICY IF EXISTS "Allow all operations on stories" ON stories;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on follows" ON follows;
DROP POLICY IF EXISTS "Allow all operations on stories" ON stories;

-- Create permissive policies
CREATE POLICY "Allow all operations on follows" ON follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stories" ON stories FOR ALL USING (true) WITH CHECK (true);