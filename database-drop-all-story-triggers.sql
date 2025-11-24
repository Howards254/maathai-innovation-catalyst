-- Drop ALL triggers on stories table

-- Find and drop all triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'stories'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON stories CASCADE', trigger_record.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Drop all functions that might be used by triggers
DROP FUNCTION IF EXISTS create_story_activity() CASCADE;
DROP FUNCTION IF EXISTS log_story_activity() CASCADE;
DROP FUNCTION IF EXISTS handle_story_insert() CASCADE;
DROP FUNCTION IF EXISTS story_activity_feed() CASCADE;
DROP FUNCTION IF EXISTS add_story_to_feed() CASCADE;

-- Verify no triggers remain
SELECT 'All triggers dropped' as status;
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'stories';
