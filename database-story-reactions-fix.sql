-- Fix story reactions table for proper upsert functionality
-- Run this to ensure story reactions work correctly

-- Create story_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'fire', 'clap', 'laugh', 'wow', 'sad', 'angry', 'planted', 'inspiring')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Create story_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

-- Policies for story_reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON story_reactions;
DROP POLICY IF EXISTS "Users can manage their reactions" ON story_reactions;

CREATE POLICY "Anyone can view reactions" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their reactions" ON story_reactions FOR ALL USING (auth.uid() = user_id);

-- Policies for story_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON story_comments;
DROP POLICY IF EXISTS "Users can create comments" ON story_comments;
DROP POLICY IF EXISTS "Users can manage their comments" ON story_comments;

CREATE POLICY "Anyone can view comments" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON story_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can manage their comments" ON story_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their comments" ON story_comments FOR DELETE USING (auth.uid() = author_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON story_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

SELECT 'Story reactions and comments tables fixed' as status;