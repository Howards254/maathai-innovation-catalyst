-- Simple Follow System Fix
-- Run this in Supabase SQL Editor

-- 1. Add link column to notifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'link'
    ) THEN
        ALTER TABLE notifications ADD COLUMN link TEXT;
    END IF;
END $$;

-- 2. Ensure follows table has proper constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'follows' AND constraint_name = 'follows_follower_id_following_id_key'
    ) THEN
        ALTER TABLE follows ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE(follower_id, following_id);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- 3. Create notification function if it doesn't exist
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
EXCEPTION
    WHEN others THEN
        RETURN NULL;
END;
$$;

SELECT 'Follow system fix applied' as status;