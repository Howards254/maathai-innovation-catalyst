-- Online Status and Read Receipts - Safe Migration

-- 1. Add online status columns to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_online') THEN
    ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_seen') THEN
    ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 2. Drop old functions
DROP FUNCTION IF EXISTS update_online_status(UUID, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS increment_unread_count() CASCADE;
DROP TRIGGER IF EXISTS increment_unread_on_message ON messages;

-- 3. Create update online status function
CREATE OR REPLACE FUNCTION update_online_status(user_id UUID, online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET is_online = online, last_seen = NOW() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create increment unread function
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger
CREATE TRIGGER increment_unread_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();
