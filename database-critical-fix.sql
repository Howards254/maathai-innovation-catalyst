-- CRITICAL FIX: Profile Creation and Foreign Key Issues
-- Run this in Supabase SQL Editor

-- 1. Create function to automatically create profile on user signup
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

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix discussions table - change category to TEXT
ALTER TABLE discussions ALTER COLUMN category TYPE TEXT USING category::TEXT;

-- 5. Add is_anonymous column if missing
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

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

-- 7. Enable Row Level Security (RLS) on profiles if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. Fix discussions RLS policies
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON discussions;
CREATE POLICY "Discussions are viewable by everyone"
  ON discussions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create discussions" ON discussions;
CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own discussions" ON discussions;
CREATE POLICY "Users can update own discussions"
  ON discussions FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own discussions" ON discussions;
CREATE POLICY "Users can delete own discussions"
  ON discussions FOR DELETE
  USING (auth.uid() = author_id);

-- 10. Verify the fix
SELECT 'Profiles created: ' || COUNT(*) FROM profiles;
SELECT 'Users without profiles: ' || COUNT(*) 
FROM auth.users au 
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);
