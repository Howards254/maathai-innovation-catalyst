# Password Reset Troubleshooting Guide

## Quick Fix Steps

### 1. **Verify Supabase Dashboard Configuration** (MOST IMPORTANT)

Go to your Supabase Dashboard and configure these settings:

#### A. URL Configuration (Authentication → URL Configuration)

1. **Site URL**: Set to your application URL
   - Local: `http://localhost:3000`
   - Production: `https://your-actual-domain.com`

2. **Redirect URLs**: Add ALL of these (click "Add URL" for each):
   ```
   http://localhost:3000/**
   http://localhost:3000/reset-password
   http://localhost:3000/auth/callback
   https://your-domain.com/**
   https://your-domain.com/reset-password
   https://your-domain.com/auth/callback
   ```

   **Note**: The `**` wildcard is important for local development!

#### B. Email Templates (Authentication → Email Templates → Reset Password)

Verify the template contains:
```html
<a href="{{ .SiteURL }}/reset-password">Reset Password</a>
```

Or the full URL:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**DO NOT** use a hardcoded URL like `https://example.com/reset-password`

### 2. **Clear Browser Data**

Before testing:
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Clear all site data
4. Close and reopen browser
5. Or use Incognito/Private mode

### 3. **Test the Flow**

1. Go to `/forgot-password`
2. Enter your email
3. Check your email inbox (and spam folder!)
4. Click the reset link
5. Open browser console (F12) to see debug logs

### 4. **Use the Debug Tool**

If still having issues:
1. Copy the full reset link from your email
2. Replace `/reset-password` with `/debug-reset-password` in the URL
3. Visit that URL to see detailed diagnostic information

Example:
```
Original: http://localhost:3000/reset-password#access_token=...
Debug:    http://localhost:3000/debug-reset-password#access_token=...
```

## Common Issues & Solutions

### Issue 1: "Invalid or expired reset link" immediately

**Cause**: Redirect URL not configured in Supabase Dashboard

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your redirect URLs (see step 1 above)
3. Save changes
4. Request a NEW password reset (old links won't work)

### Issue 2: Token not found in URL

**Cause**: Email template is incorrect or using wrong URL

**Solution**:
1. Check email template uses `{{ .SiteURL }}/reset-password` or `{{ .ConfirmationURL }}`
2. Verify Site URL is set correctly in Supabase Dashboard
3. Request a new reset link

### Issue 3: Session verification fails

**Cause**: Supabase client configuration or environment variables

**Solution**:
1. Check `.env` file has correct values:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
2. Restart your dev server after changing .env
3. Verify the URL and key are correct in Supabase Dashboard → Settings → API

### Issue 4: CORS errors

**Cause**: Domain not allowed in Supabase

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Under "CORS Allowed Origins", add:
   - `http://localhost:3000`
   - `https://your-domain.com`

### Issue 5: Token expired

**Cause**: Reset links expire after 1 hour by default

**Solution**:
- Request a new password reset link
- Click the link within 1 hour

## Code Changes Made

### 1. Updated `lib/supabase.ts`
Added proper auth configuration:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,  // Important for password reset
    flowType: 'pkce'
  }
});
```

### 2. Improved `pages/auth/ResetPassword.tsx`
- Better token validation
- Session verification with Supabase
- Detailed console logging for debugging

### 3. Added Debug Tool
- New route: `/debug-reset-password`
- Shows all URL parameters, tokens, and session info
- Provides specific recommendations

## Testing Checklist

- [ ] Supabase Site URL is configured correctly
- [ ] Redirect URLs include your domain with `/**` wildcard
- [ ] Email template uses `{{ .SiteURL }}` or `{{ .ConfirmationURL }}`
- [ ] Environment variables are set correctly
- [ ] Dev server restarted after .env changes
- [ ] Browser cache cleared
- [ ] Reset link clicked within 1 hour
- [ ] Browser console shows no CORS errors
- [ ] Debug tool shows token is present

## Still Having Issues?

1. Visit `/debug-reset-password` with your reset link
2. Take a screenshot of the debug page
3. Check browser console for errors (F12 → Console tab)
4. Verify email template in Supabase Dashboard
5. Check Supabase logs: Dashboard → Logs → Auth Logs

## Expected Console Output (Success)

When everything works, you should see:
```
Password reset email sent successfully to: user@example.com
Password reset - Token check: { hasToken: true, type: 'recovery', ... }
Session verified successfully
```

## Expected Console Output (Failure)

If there's an issue:
```
Password reset - Token check: { hasToken: false, type: null, ... }
Session verification error: [error details]
```

## Additional Notes

- Password reset tokens are single-use
- Only one active reset token per user at a time
- Requesting a new reset invalidates previous tokens
- Tokens expire after 1 hour by default
- After successful reset, user must login with new password
