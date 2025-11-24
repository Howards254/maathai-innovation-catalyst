-- Check and add missing columns to profiles table

-- Add username column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  END IF;
END $$;

-- Add bio column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Add location column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
END $$;

-- Add website column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
END $$;

-- Update RLS policies to allow username queries
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);
