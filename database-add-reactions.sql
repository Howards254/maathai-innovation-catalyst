-- Add reactions and fix comments

-- 1. Create reactions table
CREATE TABLE IF NOT EXISTS discussion_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- 2. Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_discussion ON discussion_reactions(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_user ON discussion_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_discussion ON comments(discussion_id);

-- 4. Enable RLS
ALTER TABLE discussion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for reactions
CREATE POLICY "Anyone can view reactions" ON discussion_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON discussion_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON discussion_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add comment reactions" ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own comment reactions" ON comment_reactions FOR DELETE USING (auth.uid() = user_id);
