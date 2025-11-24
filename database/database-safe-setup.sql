-- GreenVerse - Safe Database Setup (handles existing objects)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stories table (the missing one causing errors)
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on stories if not already enabled
DO $$ BEGIN
  ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create RLS policy for stories (drop first if exists)
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create stories" ON stories;
CREATE POLICY "Authenticated users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix foreign key relationships
DO $$ BEGIN
  -- Fix stories foreign key
  ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
  ALTER TABLE stories ADD CONSTRAINT stories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';