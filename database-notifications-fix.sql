-- Fix: Add missing notifications table
-- Run this in Supabase SQL Editor

-- Create notifications table (the missing table causing the error)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('follow', 'message', 'like', 'comment', 'mention', 'friend_activity')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" ON notifications 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications 
    FOR UPDATE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

-- Create notification function
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_from_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link, from_user_id)
    VALUES (p_user_id, p_type, p_title, p_message, p_link, p_from_user_id)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

SELECT 'Notifications table created successfully' as status;