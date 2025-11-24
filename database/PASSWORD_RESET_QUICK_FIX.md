# Password Reset Quick Fix Guide

## 🚨 You're seeing "Invalid Reset Link" - Here's what to do:

### Step 1: Debug the URL (Do this first!)
1. When you receive the password reset email, **copy the entire link**
2. Replace `/reset-password` with `/debug-reset-url` in the URL
3. Visit that URL to see what's wrong

**Example:**
```
Original: http://localhost:3000/reset-password#access_token=abc123...
Debug:    http://localhost:3000/debug-reset-url#access_token=abc123...
```

The debug page will show you:
- ✅ Whether the token is present
- ✅ Whether the type is correct
- ✅ Specific recommendations for your situation

---

### Step 2: Fix Supabase Configuration

Go to your **Supabase Dashboard** (https://supabase.com/dashboard):

#### A. URL Configuration
Navigate to: **Authentication → URL Configuration**

1. **Site URL**: Set to `http://localhost:3000` (or your production URL)

2. **Redirect URLs**: Click "Add URL" for each of these:
   ```
   http://localhost:3000/**
   http://localhost:3000/reset-password
   http://localhost:3000/auth/callback
   ```
   
   ⚠️ **Important**: The `/**` wildcard is critical for local development!

#### B. Email Template
Navigate to: **Authentication → Email Templates → Reset Password**

Make sure the template contains:
```html
<a href="{{ .SiteURL }}/reset-password">Reset Password</a>
```

**DO NOT** use a hardcoded URL like `https://example.com/reset-password`

---

### Step 3: Verify Environment Variables

Check your `.env` file has the correct values:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Get these from: **Supabase Dashboard → Settings → API**

⚠️ **After changing .env**, restart your dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### Step 4: Clear Browser Cache

1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Click "Clear site data"
4. Close and reopen browser

**OR** use Incognito/Private mode for testing

---

### Step 5: Request a New Reset Link

1. Go to `/forgot-password`
2. Enter your email
3. Check your inbox (and spam folder!)
4. Click the link **within 1 hour** (tokens expire)

---

## Common Issues & Quick Fixes

### ❌ "No access token found"
**Cause**: Redirect URL not configured in Supabase  
**Fix**: Add `http://localhost:3000/**` to redirect URLs (Step 2A)

### ❌ "Invalid type"
**Cause**: Email template is incorrect  
**Fix**: Update email template to use `{{ .SiteURL }}/reset-password` (Step 2B)

### ❌ "Token expired"
**Cause**: Link is more than 1 hour old  
**Fix**: Request a new password reset link (Step 5)

### ❌ CORS errors in console
**Cause**: Domain not allowed in Supabase  
**Fix**: Go to **Settings → API → CORS Allowed Origins**, add `http://localhost:3000`

---

## Testing Checklist

Before requesting a new reset link, verify:

- [ ] Supabase Site URL is set to `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email template uses `{{ .SiteURL }}/reset-password`
- [ ] Environment variables are correct
- [ ] Dev server was restarted after .env changes
- [ ] Browser cache is cleared

---

## Still Not Working?

1. Visit `/debug-reset-url` with your reset link
2. Take a screenshot of the debug page
3. Check browser console (F12 → Console) for errors
4. Check Supabase logs: **Dashboard → Logs → Auth Logs**

---

## Quick Commands

```bash
# Restart dev server
npm run dev

# Check environment variables are loaded
echo $VITE_SUPABASE_URL

# Clear node_modules and reinstall (if all else fails)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Important Notes

- 🔒 Password reset tokens are **single-use**
- ⏰ Tokens **expire after 1 hour**
- 🔄 Requesting a new reset **invalidates previous tokens**
- 🚪 After successful reset, you must **login with the new password**
- 📧 Only **one active reset token** per user at a time

---

## Success Indicators

When everything works correctly, you should see in the browser console:
```
Password reset email sent successfully to: user@example.com
Password reset - Token check: { hasToken: true, type: 'recovery', ... }
```

And the `/debug-reset-url` page should show:
```
✅ Valid reset token found! You can proceed to /reset-password
```
