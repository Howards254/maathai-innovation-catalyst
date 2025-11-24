# Password Reset - Quick Fix Checklist

## ✅ Code Fixes Applied
- [x] Added `/debug-reset-password` route for troubleshooting
- [x] Enhanced token validation to verify session establishment
- [x] Improved error logging and messages

## 🔧 Required Supabase Configuration (DO THIS NOW)

### 1. Add Redirect URLs (CRITICAL)
**URL**: https://supabase.com/dashboard/project/hhtiutkjtfchqpgplblp/auth/url-configuration

Click "Add URL" for each of these:
```
http://localhost:3000/reset-password
http://localhost:5173/reset-password
http://localhost:3000/**
http://localhost:5173/**
```

Then click **SAVE**.

### 2. Set Site URL
In the same page, set **Site URL** to:
```
http://localhost:3000
```
(or `http://localhost:5173` if that's your dev port)

### 3. Verify Email Template
**URL**: https://supabase.com/dashboard/project/hhtiutkjtfchqpgplblp/auth/templates

Click "Reset Password" template and ensure it contains:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

## 🧪 Test the Fix

### Option 1: Use Debug Page (Recommended)
1. Request password reset at: http://localhost:3000/forgot-password
2. Check your email
3. **Replace** `/reset-password` with `/debug-reset-password` in the link
4. The debug page will tell you exactly what's wrong

### Option 2: Normal Flow
1. Request password reset
2. Click the email link
3. Check browser console (F12) for errors
4. If it works, set your new password!

## 🚨 If Still Not Working

### Check This First:
1. Did you click **SAVE** in Supabase after adding redirect URLs?
2. Is your dev server running on the same port as the Site URL?
3. Did you check spam folder for the reset email?

### Use Debug Page:
Replace `/reset-password` with `/debug-reset-password` in any reset link to see:
- ✅ or ❌ Access Token in Hash
- ✅ or ❌ Type is Recovery
- ✅ or ❌ Session Active
- ✅ or ❌ Supabase Configured

### Common Quick Fixes:
- **No token in URL**: Email template issue - verify step 3 above
- **Token but no session**: Redirect URLs not configured - verify step 1 above
- **Wrong type**: You clicked a signup link, not a password reset link

## 📞 Need More Help?

See detailed guide: `PASSWORD_RESET_FIX.md`

---
**TL;DR**: Add redirect URLs to Supabase Dashboard, save, then test!
