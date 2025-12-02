-- Fix real-time messaging by enabling realtime for authenticated users
-- This allows Supabase real-time to work properly

-- Enable realtime on messages and conversations tables for all authenticated users
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Grant necessary permissions for realtime
GRANT SELECT ON messages TO authenticated;
GRANT SELECT ON conversations TO authenticated;
GRANT SELECT ON conversation_participants TO authenticated;
GRANT SELECT ON profiles TO authenticated;

-- Create a simple policy that allows realtime to work
DROP POLICY IF EXISTS "Enable realtime for messages" ON messages;
CREATE POLICY "Enable realtime for messages" ON messages
FOR SELECT USING (
  -- Allow if user is participant in the conversation
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- Ensure RLS is enabled but not blocking realtime
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

-- Update online status function to be accessible
GRANT EXECUTE ON FUNCTION update_online_status(UUID, BOOLEAN) TO authenticated;

SELECT 'Real-time messaging enabled' as status;