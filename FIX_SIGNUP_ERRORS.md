# Fix for Signup Errors (406 & 500)

## Issues Fixed

### 1. **406 Error (Not Acceptable)** 
- **Cause**: Using `.single()` in username availability check
- **Fix**: Changed to `.maybeSingle()` which doesn't throw error when no rows found
- **Files Updated**: 
  - `pages/auth/Register.tsx`
  - `pages/profile/ProfileEdit.tsx`

### 2. **500 Error (Internal Server Error)**
- **Cause**: Database trigger failing when creating profile
- **Fix**: Improved trigger with better error handling and conflict resolution
- **File Created**: `supabase/migrations/004_fix_user_trigger.sql`

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd /home/amosoluoch/Desktop/maathai-innovation-catalyst

# Apply the new migration
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/004_fix_user_trigger.sql`
4. Run the SQL

### Option 3: Using psql

```bash
psql -h db.hhtiutkjtfchqpgplblp.supabase.co -U postgres -d postgres -f supabase/migrations/004_fix_user_trigger.sql
```

## Testing

After applying the migration:

1. Clear your browser cache and local storage
2. Try creating a new account with username "amosdev" or any other username
3. The 406 error should be gone
4. The 500 error should be resolved

## What Changed

### Frontend Changes
- Username availability check now uses `maybeSingle()` instead of `single()`
- Added proper error code handling (PGRST116 for "no rows")
- Better error logging for debugging

### Backend Changes
- Trigger now has `ON CONFLICT` handling
- Generates unique username if conflict occurs
- Uses `EXCEPTION` block to prevent auth failure
- Logs warnings instead of failing completely

## Verification

After signup, verify:
- User is created in `auth.users` table
- Profile is created in `profiles` table with correct username
- No errors in browser console
- Redirect to login page works
