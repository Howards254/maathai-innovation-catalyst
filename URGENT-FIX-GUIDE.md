# 🚨 URGENT FIX GUIDE - GreenVerse Critical Issues

## Problems Identified

1. **Foreign Key Constraint Violation** (Error 23503)
   - Users can't create discussions because their profile doesn't exist
   - Root cause: No automatic profile creation on user signup

2. **Infinite Retry Loop** (ERR_INSUFFICIENT_RESOURCES)
   - MatchmakingContext and GroupsContext causing browser resource exhaustion
   - Repeated failed API calls without proper error handling

## 🔧 IMMEDIATE FIXES

### Step 1: Fix Database (Run in Supabase SQL Editor)

**Option A: Use the comprehensive fix file**
```bash
# Run this file in Supabase SQL Editor:
database-critical-fix.sql
```

**Option B: Use the updated discussions fix**
```bash
# Run this file in Supabase SQL Editor:
database-discussions-fix.sql
```

Both files will:
- ✅ Create automatic profile creation trigger
- ✅ Fix discussions category column (enum → text)
- ✅ Add is_anonymous column
- ✅ Create profiles for existing users
- ✅ Set up proper RLS policies

### Step 2: Verify Database Fix

Run this in Supabase SQL Editor:
```sql
-- Check if profiles exist for all users
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles
FROM auth.users;

-- Should show same number for both
```

### Step 3: Test User Registration

1. Sign out of your app
2. Create a new test account
3. Check if profile was created automatically:
```sql
SELECT * FROM profiles WHERE id = '<your-new-user-id>';
```

### Step 4: Frontend Fix (Already Applied)

The MatchmakingContext has been updated with:
- ✅ Debounced data loading (500ms delay)
- ✅ Proper error handling (no throw on error)
- ✅ Dependency array fix to prevent infinite loops

## 🧪 Testing Checklist

- [ ] New user registration creates profile automatically
- [ ] Existing users can create discussions
- [ ] No ERR_INSUFFICIENT_RESOURCES errors in console
- [ ] Green Matchmaking page loads without infinite retries
- [ ] Groups page loads without infinite retries

## 📊 Monitoring

Watch browser console for these errors:
```
❌ BAD: "Error loading teams" repeating rapidly
❌ BAD: "ERR_INSUFFICIENT_RESOURCES"
❌ BAD: "23503 foreign key constraint"

✅ GOOD: Single error log, then stops
✅ GOOD: Data loads successfully
✅ GOOD: No repeated fetch attempts
```

## 🔄 If Issues Persist

### Profile Creation Still Failing?
```sql
-- Manually create profile for current user
INSERT INTO profiles (id, username, full_name, impact_points, role)
VALUES (
  '<your-user-id>',
  'your_username',
  'Your Full Name',
  0,
  'user'
);
```

### Still Getting Infinite Loops?
1. Clear browser cache and local storage
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('green_teams', 'user_matches', 'profiles');
```

## 📝 Root Cause Analysis

### Why This Happened

1. **Missing Trigger**: Database setup didn't include automatic profile creation
2. **No Error Boundaries**: Frontend contexts didn't handle missing tables gracefully
3. **Aggressive Retries**: useEffect dependencies caused infinite re-renders

### Prevention

- ✅ Always create database triggers for auth events
- ✅ Add error boundaries in contexts
- ✅ Use debouncing for data fetching
- ✅ Proper dependency arrays in useEffect

## 🆘 Emergency Contacts

If you need to completely reset:

```sql
-- DANGER: This deletes all data
TRUNCATE profiles, discussions, campaigns, events CASCADE;

-- Then re-run database-setup.sql
```

## ✅ Success Indicators

You'll know it's fixed when:
1. New users can register and immediately create discussions
2. Console shows max 1-2 error logs, not hundreds
3. Pages load in under 3 seconds
4. No browser tab crashes

---

**Last Updated**: Now
**Status**: Fixes applied, awaiting verification
