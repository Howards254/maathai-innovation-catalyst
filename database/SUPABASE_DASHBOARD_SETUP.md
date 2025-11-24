# Supabase Dashboard Configuration Guide

## 🚨 CRITICAL SETUP REQUIRED

The password reset will NOT work until you complete these steps in your Supabase Dashboard.

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Click on **Authentication** in the left sidebar

### Step 2: Configure URL Settings

1. Click on **URL Configuration** (under Authentication)
2. You'll see a form with several fields

#### A. Site URL

This is the main URL of your application.

**For Local Development:**
```
http://localhost:3000
```

**For Production:**
```
https://your-actual-domain.com
```

⚠️ **Important**: 
- Do NOT include trailing slash
- Use the EXACT URL where your app is hosted
- For production, use your actual domain (e.g., `https://maathai-catalyst.com`)

#### B. Redirect URLs

Click the **"Add URL"** button for EACH of these:

**For Local Development:**
```
http://localhost:3000/**
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

**For Production:**
```
https://your-domain.com/**
https://your-domain.com/reset-password
https://your-domain.com/auth/callback
```

⚠️ **Important**: 
- The `/**` wildcard is REQUIRED for local development
- Add BOTH local and production URLs if you're testing both
- Each URL must be on a separate line (click "Add URL" for each)

#### C. Save Changes

Click **"Save"** at the bottom of the form.

### Step 3: Verify Email Template

1. Still in **Authentication**, click on **Email Templates**
2. Select **Reset Password** from the dropdown
3. Verify the template contains one of these:

**Option 1 (Recommended):**
```html
<a href="{{ .SiteURL }}/reset-password">Reset Password</a>
```

**Option 2 (Also works):**
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

⚠️ **DO NOT use hardcoded URLs like:**
```html
<!-- ❌ WRONG -->
<a href="https://example.com/reset-password">Reset Password</a>
```

4. If you made changes, click **"Save"**

### Step 4: Check CORS Settings (Optional but Recommended)

1. Go to **Settings** → **API** in the left sidebar
2. Scroll down to **CORS Allowed Origins**
3. Ensure your domain is listed:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

### Step 5: Verify API Keys

While you're in **Settings** → **API**:

1. Copy your **Project URL** (should match your .env file)
2. Copy your **anon public** key (should match your .env file)

Update your `.env` file if needed:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

⚠️ **After updating .env**: Restart your development server!

## Visual Checklist

Use this checklist to ensure everything is configured:

### URL Configuration
- [ ] Site URL is set to your application URL
- [ ] Redirect URL includes `http://localhost:3000/**`
- [ ] Redirect URL includes `http://localhost:3000/reset-password`
- [ ] Redirect URL includes production URLs (if applicable)
- [ ] Changes are saved

### Email Templates
- [ ] Reset Password template uses `{{ .SiteURL }}` or `{{ .ConfirmationURL }}`
- [ ] No hardcoded URLs in the template
- [ ] Changes are saved

### API Settings
- [ ] CORS origins include your domain
- [ ] Project URL matches .env file
- [ ] Anon key matches .env file

### Local Environment
- [ ] .env file has correct values
- [ ] Development server restarted after .env changes
- [ ] Browser cache cleared

## Testing After Configuration

1. **Clear browser data** (or use Incognito mode)
2. Go to your app: `http://localhost:3000/forgot-password`
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email (including spam folder)
6. Click the reset link in the email
7. You should see the password reset form (not an error)

## Troubleshooting

### Issue: Still getting "Invalid or expired reset link"

**Check:**
1. Did you add the redirect URLs with `/**` wildcard?
2. Did you save the changes in Supabase Dashboard?
3. Did you request a NEW password reset after making changes?
4. Is the Site URL exactly matching your application URL?

**Try:**
- Request a new password reset (old links won't work with new settings)
- Use the debug tool: `/debug-reset-password`
- Check browser console for error messages

### Issue: Not receiving reset emails

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Supabase email rate limits (max 3-4 per hour per email)
4. Supabase Dashboard → Authentication → Logs for errors

**Try:**
- Wait 5-10 minutes and try again
- Use a different email address
- Check Supabase logs for delivery errors

### Issue: CORS errors in console

**Solution:**
1. Go to Settings → API → CORS Allowed Origins
2. Add your domain (e.g., `http://localhost:3000`)
3. Save and restart your dev server

## Common Mistakes to Avoid

❌ **Mistake 1**: Forgetting the `/**` wildcard
```
http://localhost:3000/reset-password  ❌ Only this exact path
http://localhost:3000/**              ✅ All paths under domain
```

❌ **Mistake 2**: Including trailing slash in Site URL
```
http://localhost:3000/   ❌ Has trailing slash
http://localhost:3000    ✅ No trailing slash
```

❌ **Mistake 3**: Not requesting new reset after config changes
- Old reset links won't work with new configuration
- Always request a NEW reset link after changing settings

❌ **Mistake 4**: Not restarting dev server after .env changes
- Changes to .env require server restart
- Stop server (Ctrl+C) and start again

## Need More Help?

1. Use the debug tool: `/debug-reset-password`
2. Read the troubleshooting guide: `PASSWORD_RESET_TROUBLESHOOTING.md`
3. Check browser console (F12) for error messages
4. Review Supabase Auth logs in Dashboard

## Quick Reference

| Setting | Location | Value |
|---------|----------|-------|
| Site URL | Auth → URL Config | `http://localhost:3000` |
| Redirect URLs | Auth → URL Config | `http://localhost:3000/**` |
| Email Template | Auth → Email Templates | `{{ .SiteURL }}/reset-password` |
| CORS Origins | Settings → API | `http://localhost:3000` |

---

**After completing these steps, request a NEW password reset and test the flow!**
