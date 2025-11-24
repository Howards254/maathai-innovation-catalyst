-- Messaging System Database Setup - Safe Migration

-- 1. Drop old triggers and functions first
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID) CASCADE;

-- 2. Create or update conversations table
DO $$ 
BEGIN
  -- Create table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='conversations') THEN
    CREATE TABLE conversations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      is_group BOOLEAN DEFAULT false,
      name TEXT,
      avatar_url TEXT,
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='is_group') THEN
      ALTER TABLE conversations ADD COLUMN is_group BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='name') THEN
      ALTER TABLE conversations ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='avatar_url') THEN
      ALTER TABLE conversations ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='created_by') THEN
      ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='updated_at') THEN
      ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 3. Create or update conversation_participants table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='conversation_participants') THEN
    CREATE TABLE conversation_participants (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_admin BOOLEAN DEFAULT false,
      unread_count INTEGER DEFAULT 0,
      UNIQUE(conversation_id, user_id)
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversation_participants' AND column_name='unread_count') THEN
      ALTER TABLE conversation_participants ADD COLUMN unread_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversation_participants' AND column_name='is_admin') THEN
      ALTER TABLE conversation_participants ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

-- 4. Create or update messages table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='messages') THEN
    CREATE TABLE messages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
      sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      content TEXT,
      media_urls TEXT[],
      media_type TEXT,
      reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add conversation_id if missing (old schema had recipient_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='conversation_id') THEN
      ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='media_urls') THEN
      ALTER TABLE messages ADD COLUMN media_urls TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='reply_to') THEN
      ALTER TABLE messages ADD COLUMN reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_deleted') THEN
      ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='updated_at') THEN
      ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 6. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. Drop old policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- 8. Create new policies
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT 
  USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update conversations" ON conversations FOR UPDATE 
  USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view participants" ON conversation_participants FOR SELECT 
  USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave conversations" ON conversation_participants FOR DELETE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view messages" ON messages FOR SELECT 
  USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can send messages" ON messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id AND conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own messages" ON messages FOR UPDATE 
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON messages FOR DELETE 
  USING (auth.uid() = sender_id);

-- 9. Create functions
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT c.id INTO conv_id
  FROM conversations c
  WHERE c.is_group = false
    AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = user1_id)
    AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = user2_id)
  LIMIT 1;
  
  IF conv_id IS NULL THEN
    INSERT INTO conversations (is_group, created_by) VALUES (false, user1_id) RETURNING id INTO conv_id;
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, user1_id), (conv_id, user2_id);
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
