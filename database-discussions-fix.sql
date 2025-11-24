-- COMPREHENSIVE FIX FOR DISCUSSIONS AND PROFILES
-- Run this in Supabase SQL Editor

-- 1. Fix discussions table - change category to TEXT
ALTER TABLE discussions ALTER COLUMN category TYPE TEXT USING category::TEXT;

-- 2. Add is_anonymous column if missing
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- 3. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, impact_points, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL,
    0,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, username, full_name, impact_points, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Anonymous User'),
  0,
  'user'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 7. Verify the fix
SELECT 'Profiles created: ' || COUNT(*) as status FROM profiles;
SELECT 'Users without profiles: ' || COUNT(*) as status
FROM auth.users au 
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);
