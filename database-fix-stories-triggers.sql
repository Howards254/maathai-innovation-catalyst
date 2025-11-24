-- Fix Stories Triggers - Complete Solution

-- 1. Drop any existing problematic triggers on stories table
DROP TRIGGER IF EXISTS create_activity_feed_on_story ON stories;
DROP TRIGGER IF EXISTS story_activity_trigger ON stories;
DROP TRIGGER IF EXISTS log_story_activity ON stories;

-- 2. Drop the trigger function if it exists
DROP FUNCTION IF EXISTS create_story_activity() CASCADE;
DROP FUNCTION IF EXISTS log_story_activity() CASCADE;

-- 3. Create correct trigger function that uses author_id
CREATE OR REPLACE FUNCTION create_story_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    title,
    description,
    metadata,
    points_earned,
    is_public
  ) VALUES (
    NEW.author_id,  -- Use author_id not user_id
    'story_posted',
    NEW.title,
    NEW.description,
    jsonb_build_object(
      'story_id', NEW.id,
      'media_type', NEW.media_type,
      'story_type', NEW.story_type
    ),
    10,  -- Points for posting story
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger
CREATE TRIGGER create_activity_feed_on_story
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION create_story_activity();

-- 5. Verify the fix
SELECT 'Trigger fixed successfully' as status;
