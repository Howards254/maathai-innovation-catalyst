-- Fix foreign key relationships and add missing constraints

-- Fix stories table foreign key (if it exists but relationship is broken)
DO $$ BEGIN
    -- Drop and recreate the foreign key constraint
    ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
    ALTER TABLE stories ADD CONSTRAINT stories_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
    WHEN others THEN
        -- If table doesn't exist, create it properly
        CREATE TABLE IF NOT EXISTS stories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'video')),
            media_url TEXT NOT NULL,
            caption TEXT,
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
END $$;

-- Ensure all foreign key constraints exist
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_fkey 
    FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant_1_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant_1_fkey 
    FOREIGN KEY (participant_1) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant_2_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant_2_fkey 
    FOREIGN KEY (participant_2) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_matches DROP CONSTRAINT IF EXISTS user_matches_user_id_fkey;
ALTER TABLE user_matches ADD CONSTRAINT user_matches_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_matches DROP CONSTRAINT IF EXISTS user_matches_matched_user_id_fkey;
ALTER TABLE user_matches ADD CONSTRAINT user_matches_matched_user_id_fkey 
    FOREIGN KEY (matched_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';