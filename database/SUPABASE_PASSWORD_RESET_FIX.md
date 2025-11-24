# Password Reset Link Fix

## Problem
Users are getting "Invalid or expired reset link" error immediately after clicking the password reset link.

## Root Causes Identified

1. **Supabase Auth Configuration**: The Supabase client wasn't configured to properly detect and handle sessions from URL parameters
2. **Token Validation Logic**: The validation was too strict and didn't properly verify the session with Supabase
3. **Supabase Dashboard Configuration**: The Site URL and Redirect URLs might not be properly configured

## Fixes Applied

### 1. Updated Supabase Client Configuration (`lib/supabase.ts`)
- Added `detectSessionInUrl: true` to automatically handle auth tokens in URL
- Added `flowType: 'pkce'` for better security
- Enabled `autoRefreshToken` and `persistSession`

### 2. Improved Token Validation (`pages/auth/ResetPassword.tsx`)
- Added proper session verification with Supabase
- Added detailed console logging for debugging
- Better error handling and user feedback

### 3. Required Supabase Dashboard Configuration

**IMPORTANT**: You must configure these settings in your Supabase Dashboard:

1. Go to: **Authentication > URL Configuration**

2. Set **Site URL** to your application URL:
   - For local development: `http://localhost:3000`
   - For production: `https://your-domain.com`

3. Add **Redirect URLs** (add ALL of these):
   - `http://localhost:3000/reset-password`
   - `http://localhost:3000/**` (wildcard for local dev)
   - `https://your-domain.com/reset-password`
   - `https://your-domain.com/**` (wildcard for production)

4. **Email Templates** (Authentication > Email Templates > Reset Password):
   - Ensure the reset link uses: `{{ .SiteURL }}/reset-password`
   - The default template should work, but verify it's not customized incorrectly

## Testing Steps

1. **Clear browser cache and cookies** (important!)
2. Request a new password reset from `/forgot-password`
3. Check your email and click the reset link
4. Open browser console (F12) to see debug logs
5. You should see:
   ```
   Password reset - Token check: { hasToken: true, type: 'recovery', ... }
   Session verified successfully
   ```

## Debugging

If the issue persists, check the browser console for these logs:
- `Password reset - Token check:` - Shows if token was found
- `Session verification error:` - Shows Supabase session errors
- `Error during token validation:` - Shows any unexpected errors

## Common Issues

### Issue: Token not found in URL
**Solution**: Check that the email link includes the hash fragment with `access_token` and `type=recovery`

### Issue: Session verification fails
**Solution**: 
1. Verify Supabase URL and Anon Key in `.env` file
2. Check that Redirect URLs are configured in Supabase Dashboard
3. Ensure the reset link hasn't expired (default: 1 hour)

### Issue: CORS errors
**Solution**: Add your domain to Supabase Dashboard > Settings > API > CORS Allowed Origins

## Additional Notes

- Password reset tokens expire after 1 hour by default
- Users can only have one active reset token at a time
- Requesting a new reset invalidates previous tokens
- The token is automatically consumed after successful password reset
