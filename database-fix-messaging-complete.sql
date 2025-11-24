-- Complete fix for messaging infinite recursion

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- 2. Recreate get_or_create_conversation function with SECURITY DEFINER
DROP FUNCTION IF EXISTS get_or_create_conversation(uuid, uuid);

CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Find existing conversation
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
  LIMIT 1;

  -- Create new conversation if not found
  IF conv_id IS NULL THEN
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, user1_id)
    RETURNING id INTO conv_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conv_id, user1_id), (conv_id, user2_id);
  END IF;

  RETURN conv_id;
END;
$$;

-- 3. Create simple RLS policies (no recursion)
CREATE POLICY "Users can view their own participation"
  ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own participation"
  ON conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- 4. Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

-- 5. Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());
