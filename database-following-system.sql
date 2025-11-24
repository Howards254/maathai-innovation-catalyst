-- Following/Friends System Database Setup

-- 1. Create follows table (mutual follows = friends)
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON follows(created_at DESC);

-- 3. Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;

CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 5. Add follower/following counts to profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='followers_count') THEN
    ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 6. Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    -- Increment followers_count for following
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following_count for follower
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    -- Decrement followers_count for following
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- 8. Helper function to check if users are friends (mutual follow)
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows WHERE follower_id = user1_id AND following_id = user2_id
  ) AND EXISTS (
    SELECT 1 FROM follows WHERE follower_id = user2_id AND following_id = user1_id
  );
END;
$$ LANGUAGE plpgsql;

-- 9. View for getting friends (mutual follows)
CREATE OR REPLACE VIEW user_friends AS
SELECT DISTINCT
  f1.follower_id as user_id,
  f1.following_id as friend_id,
  p.full_name as friend_name,
  p.avatar_url as friend_avatar,
  p.bio as friend_bio,
  f1.created_at
FROM follows f1
INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
INNER JOIN profiles p ON f1.following_id = p.id;

-- 10. Initialize counts for existing profiles
UPDATE profiles SET 
  followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = profiles.id),
  following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = profiles.id)
WHERE followers_count IS NULL OR following_count IS NULL;
