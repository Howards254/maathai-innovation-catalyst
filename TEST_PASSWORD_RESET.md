# Quick Test Guide for Password Reset

## Step-by-Step Testing

### 1. Verify Supabase Configuration (CRITICAL!)

Go to your Supabase Dashboard:

**Authentication → URL Configuration**

Set these EXACT values:

```
Site URL: http://localhost:3000

Redirect URLs (click "Add URL" for each):
- http://localhost:3000/**
- http://localhost:3000/reset-password
```

Click **SAVE** after adding!

### 2. Check Email Template

**Authentication → Email Templates → Reset Password**

Make sure it contains:
```html
<a href="{{ .SiteURL }}/reset-password">Reset Password</a>
```

### 3. Clear Browser & Test

1. **Open Incognito/Private window** (or clear all site data)

2. **Go to**: `http://localhost:3000/forgot-password`

3. **Enter your email** and click "Send Reset Link"

4. **Check your email** (inbox AND spam folder)

5. **Before clicking the link**, open DevTools:
   - Press F12
   - Go to Console tab
   - Keep it open

6. **Click the reset link** from your email

7. **Watch the console** - you should see:
   ```
   Password reset - Initial check: { fullUrl: "http://localhost:3000/reset-password#access_token=...", ... }
   Password reset - Session check: { hasSession: true, ... }
   Valid reset token - session established by Supabase
   ```

### 4. What to Look For

#### ✅ SUCCESS - You'll see:
- "Verifying Reset Link..." spinner (briefly)
- Form to enter new password appears
- Console shows "Valid reset token - session established"

#### ❌ FAILURE - Check console for:

**"No hash fragment found in URL"**
- Problem: Email link is wrong
- Fix: Check email template uses `{{ .SiteURL }}/reset-password`

**"Invalid token or type"**
- Problem: Token expired or wrong type
- Fix: Request a new reset link (tokens expire in 1 hour)

**"Session exchange error"**
- Problem: Supabase credentials or configuration
- Fix: Check `.env` file has correct values, restart dev server

**"Error in reset URL"**
- Problem: Supabase returned an error
- Fix: Check redirect URL is whitelisted in Supabase dashboard

## Quick Checklist

Before testing, verify:

- [ ] Supabase Site URL = `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email template uses `{{ .SiteURL }}/reset-password`
- [ ] Dev server is running on port 3000 (check terminal)
- [ ] Using Incognito mode or cleared browser data
- [ ] Browser console (F12) is open before clicking reset link

## Common Issues

### Issue: "The link doesn't have a hash (#) in it"

**Your email link looks like:**
```
http://localhost:3000/reset-password
```

**It should look like:**
```
http://localhost:3000/reset-password#access_token=eyJhbG...&type=recovery&...
```

**Fix:**
1. Site URL in Supabase must be `http://localhost:3000` (no trailing slash)
2. Email template must use `{{ .SiteURL }}/reset-password`
3. Request a NEW reset link after fixing

### Issue: "Link has hash but still shows error"

**Check console for the exact error:**
- If it says "Invalid token or type" → Token expired, request new one
- If it says "Session exchange error" → Check `.env` file and restart server
- If it says error from Supabase → Check redirect URL is whitelisted

### Issue: "Page keeps loading/spinning"

**Problem:** JavaScript error preventing state update

**Fix:**
1. Check browser console for errors
2. Make sure you're on the latest code (git pull)
3. Clear browser cache completely

## Testing Different Scenarios

### Test 1: Fresh Password Reset
1. Clear browser data
2. Request reset
3. Click link immediately
4. Should work ✅

### Test 2: Expired Token
1. Request reset
2. Wait 2+ hours
3. Click link
4. Should show "expired" error ✅

### Test 3: Reused Link
1. Request reset
2. Click link and reset password
3. Click same link again
4. Should show "invalid" error ✅

## What to Share If Still Not Working

If it's still not working, share:

1. **Console logs** (all lines starting with "Password reset -")
2. **Email link format** (copy the URL from email, remove the actual token)
3. **Supabase Site URL** (from dashboard)
4. **Redirect URLs** (from dashboard)
5. **Port your app is running on** (check terminal)

Example:
```
Console: "No hash fragment found in URL"
Email link: http://localhost:3000/reset-password (no hash!)
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/**
App running on: http://localhost:3000
```
