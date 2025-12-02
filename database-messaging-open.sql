-- Remove friends-only restriction from messaging
-- Allow all users to message each other

-- Update RLS policies for conversations to allow any user to create/join conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view conversations they participate in" ON conversations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON conversations 
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Update conversation_participants policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can manage conversation participants" ON conversation_participants;

CREATE POLICY "Users can view participants of their conversations" ON conversation_participants 
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to conversations" ON conversation_participants 
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- User can add themselves to any conversation
    user_id = auth.uid() OR
    -- Or user is already a participant in the conversation
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  )
);

-- Update messages policies to allow messaging between any users
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

CREATE POLICY "Users can view messages in conversations they participate in" ON messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to conversations they participate in" ON messages 
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- Update the get_or_create_conversation function to work without friend restrictions
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Check if conversation already exists between these two users
  SELECT c.id INTO conv_id
  FROM conversations c
  WHERE c.is_group = false
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp1 
    WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
  )
  AND (
    SELECT COUNT(*) FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id
  ) = 2;

  -- If conversation doesn't exist, create it
  IF conv_id IS NULL THEN
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, user1_id)
    RETURNING id INTO conv_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES 
      (conv_id, user1_id, true),
      (conv_id, user2_id, false);
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add online status tracking for better UX
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Function to update online status
CREATE OR REPLACE FUNCTION update_online_status(user_id UUID, online BOOLEAN)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_online = online,
    last_seen = CASE WHEN online THEN NOW() ELSE last_seen END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles(is_online, last_seen);

SELECT 'Messaging system opened to all users' as status;