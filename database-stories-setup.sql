-- Stories/Reels Database Setup - Safe Migration

-- 1. Create stories table if not exists (matches existing schema)
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  duration INTEGER,
  file_size INTEGER,
  story_type TEXT DEFAULT 'general' CHECK (story_type IN ('tree_planting', 'campaign_progress', 'event', 'education', 'cleanup', 'general')),
  location TEXT,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add file_size to stories if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stories' AND column_name='file_size') THEN
    ALTER TABLE stories ADD COLUMN file_size INTEGER;
  END IF;
  
  -- Add title and description to activity_feed if missing (for triggers)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='activity_feed') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_feed' AND column_name='title') THEN
      ALTER TABLE activity_feed ADD COLUMN title VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_feed' AND column_name='description') THEN
      ALTER TABLE activity_feed ADD COLUMN description TEXT;
    END IF;
  END IF;
END $$;

-- 3. Create story reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- 4. Create story comments table (matches existing schema)
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  mentions UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_reactions_story ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story ON story_comments(story_id);

-- 6. Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for stories
DROP POLICY IF EXISTS "Anyone can view stories" ON stories;
DROP POLICY IF EXISTS "Users can create stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Anyone can view stories" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = author_id);

-- 8. RLS Policies for story reactions
DROP POLICY IF EXISTS "Anyone can view story reactions" ON story_reactions;
DROP POLICY IF EXISTS "Users can add story reactions" ON story_reactions;
DROP POLICY IF EXISTS "Users can remove own story reactions" ON story_reactions;
CREATE POLICY "Anyone can view story reactions" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add story reactions" ON story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own story reactions" ON story_reactions FOR DELETE USING (auth.uid() = user_id);

-- 9. RLS Policies for story comments
DROP POLICY IF EXISTS "Anyone can view story comments" ON story_comments;
DROP POLICY IF EXISTS "Users can create story comments" ON story_comments;
DROP POLICY IF EXISTS "Users can update own story comments" ON story_comments;
DROP POLICY IF EXISTS "Users can delete own story comments" ON story_comments;
CREATE POLICY "Anyone can view story comments" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Users can create story comments" ON story_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own story comments" ON story_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own story comments" ON story_comments FOR DELETE USING (auth.uid() = author_id);
