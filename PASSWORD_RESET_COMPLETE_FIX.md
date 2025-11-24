# Password Reset Complete Fix Guide

## Current Issue
You're getting "Invalid or expired reset link" even after configuring URLs in Supabase.

## Root Causes Identified

1. **BrowserRouter + Hash Fragments**: Supabase sends tokens in URL hash (`#access_token=...`), which requires special handling with BrowserRouter
2. **Redirect URL Mismatch**: The redirect URL in code must exactly match what's configured in Supabase
3. **Session Detection Timing**: Race condition between Supabase auto-detection and manual token processing

## Critical Configuration Steps

### Step 1: Supabase Dashboard Configuration

#### A. URL Configuration (Authentication → URL Configuration)

1. **Site URL**: 
   ```
   http://localhost:3000
   ```

2. **Redirect URLs** (Add each one separately):
   ```
   http://localhost:3000/**
   http://localhost:3000/reset-password
   http://localhost:5173/**
   http://localhost:5173/reset-password
   ```
   
   For production, also add:
   ```
   https://yourdomain.com/**
   https://yourdomain.com/reset-password
   ```

   **IMPORTANT**: The `**` wildcard is crucial for local development!

#### B. Email Template (Authentication → Email Templates → Reset Password)

Your email template MUST use one of these formats:

**Option 1 (Recommended):**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/reset-password">Reset Password</a></p>
```

**Option 2:**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**DO NOT** use hardcoded URLs like `https://example.com/reset-password`

### Step 2: Verify Environment Variables

Check your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

**After changing .env, you MUST restart the dev server!**

### Step 3: Test the Flow

1. **Clear browser data**:
   - Open DevTools (F12)
   - Application/Storage tab → Clear site data
   - Or use Incognito mode

2. **Request password reset**:
   - Go to `http://localhost:3000/forgot-password`
   - Enter your email
   - Click "Send Reset Link"

3. **Check your email**:
   - Look in inbox AND spam folder
   - The link should look like:
     ```
     http://localhost:3000/reset-password#access_token=...&type=recovery&...
     ```

4. **Click the link and check console**:
   - Open browser DevTools (F12) → Console tab
   - You should see logs like:
     ```
     Password reset - Initial check: { fullUrl: "...", hash: "#access_token=..." }
     Password reset - Session check: { hasSession: true, user: "user@email.com" }
     Valid reset token - session established by Supabase
     ```

## Debugging Steps

### If you see "No hash fragment found in URL"

**Problem**: The email link doesn't contain the token

**Solutions**:
1. Check Supabase email template uses `{{ .SiteURL }}/reset-password` or `{{ .ConfirmationURL }}`
2. Verify Site URL is set correctly in Supabase Dashboard
3. Request a NEW password reset (old links won't work after config changes)

### If you see "Invalid token or type"

**Problem**: Token is present but invalid or wrong type

**Solutions**:
1. Check the console log for `type` - it should be `'recovery'`
2. The token might be expired (tokens expire after 1 hour)
3. Request a new password reset link

### If you see "Session exchange error"

**Problem**: Token is valid but can't be exchanged for a session

**Solutions**:
1. Verify your Supabase URL and Anon Key in `.env` are correct
2. Check Supabase Dashboard → Settings → API for the correct values
3. Restart your dev server after changing `.env`
4. Check for CORS errors in browser console

### If the page loads but immediately shows error

**Problem**: Redirect URL not whitelisted in Supabase

**Solutions**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add `http://localhost:3000/**` to Redirect URLs
3. Save and request a NEW password reset

## What the Code Does Now

1. **Waits for Supabase auto-detection** (500ms) - Supabase client automatically processes hash fragments
2. **Checks for established session** - If Supabase succeeded, we're done
3. **Manual fallback** - If auto-detection failed, manually parse and exchange tokens
4. **Error handling** - Catches and logs all errors with specific messages
5. **Security** - Clears hash from URL after successful token exchange

## Testing Checklist

- [ ] Supabase Site URL is `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**` and `http://localhost:3000/reset-password`
- [ ] Email template uses `{{ .SiteURL }}/reset-password`
- [ ] `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] Dev server restarted after any .env changes
- [ ] Browser cache cleared or using Incognito mode
- [ ] Email received with reset link
- [ ] Reset link clicked within 1 hour
- [ ] Browser console open to see debug logs
- [ ] No CORS errors in console

## Common Mistakes

1. ❌ Using port 5173 in Supabase but app runs on port 3000
2. ❌ Hardcoding URL in email template instead of using `{{ .SiteURL }}`
3. ❌ Not restarting dev server after changing `.env`
4. ❌ Not clearing browser cache/cookies
5. ❌ Clicking old reset links after changing configuration
6. ❌ Forgetting to add the `**` wildcard to redirect URLs

## Expected Behavior

### Success Flow:
1. User enters email on forgot password page
2. Email sent with reset link
3. User clicks link → redirected to `/reset-password#access_token=...`
4. Page loads, shows "Verifying Reset Link..." spinner
5. Console shows successful session establishment
6. Form appears to enter new password
7. User enters new password and submits
8. Password updated, redirected to login

### Failure Flow:
1. User clicks reset link
2. Page loads, shows "Verifying Reset Link..." spinner
3. Console shows error (check which error)
4. Error message displayed with option to request new link

## Still Not Working?

1. Open browser console (F12 → Console)
2. Copy ALL the console logs starting with "Password reset -"
3. Check the exact error message
4. Verify the URL in the email matches the redirect URL in Supabase
5. Try the debug page: `/debug-reset-password` (if you have it)

## Production Deployment

When deploying to production:

1. Update Supabase Site URL to your production domain
2. Add production domain to Redirect URLs
3. Update `.env` or environment variables with production values
4. Test the flow in production before announcing to users
