# Password Reset Configuration Guide

This guide covers the fixes implemented for password reset issues and necessary Supabase configuration.

## Issues Fixed

### 1. ✅ Password Reset Redirect Issue
**Problem**: Password reset link was redirecting to home page instead of the reset password form.

**Solution**: Updated the authentication flow to properly handle password recovery:
- Modified `AuthContext.tsx` to redirect password reset emails to `/auth/callback`
- Updated `Callback.tsx` to detect recovery type and redirect to `/reset-password`
- This ensures the reset token is properly handled before showing the form

**Files Changed**:
- `contexts/AuthContext.tsx` - Line 116: Changed redirectTo to `/auth/callback`
- `pages/auth/Callback.tsx` - Lines 11-27: Added recovery flow detection

### 2. ⚠️ Email Delay Issue
**Problem**: Password reset emails delayed by ~1 minute

**Root Causes**:
1. **Supabase Rate Limiting**: Default rate limits for email sending
2. **Email Provider Queue**: SMTP provider processing delays
3. **Email Template Processing**: Complex templates can slow delivery

## Required Supabase Configuration

### Step 1: Configure Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/reset-password
   https://yourdomain.com/auth/callback
   https://yourdomain.com/reset-password
   ```

### Step 2: Configure Email Rate Limits

1. Go to **Authentication** → **Rate Limits**
2. Adjust the following settings:

   **For Development:**
   - Email send rate: 10 emails per hour (increase if needed)
   - Password reset: 5 per hour per IP

   **For Production:**
   - Email send rate: 100+ emails per hour
   - Password reset: 10-20 per hour per IP

### Step 3: Email Template Configuration

1. Navigate to **Authentication** → **Email Templates**
2. Select **Reset password** template
3. Ensure the template uses the correct redirect URL:

   ```html
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   ```

4. **Important**: The confirmation URL will automatically include the token
5. Subject line: `🔐 Reset Your GreenVerse Password`

### Step 4: SMTP Configuration (Recommended for Production)

To reduce email delays in production:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure custom SMTP (recommended providers):
   - **SendGrid** (best for reliability)
   - **AWS SES** (best for scale)
   - **Resend** (best for developers)
   - **Postmark** (best for speed)

3. Example SendGrid configuration:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: GreenVerse
   ```

### Step 5: Enable Email Confirmations

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure these settings:
   - ✅ Enable email provider
   - ✅ Confirm email (for signups)
   - ⚙️ Secure email change (recommended)
   - ⚙️ Double confirm email changes (recommended)

## Testing the Fix

### Test Password Reset Flow:

1. **Request Reset:**
   ```bash
   # Navigate to forgot password page
   http://localhost:3000/forgot-password
   
   # Enter email and submit
   ```

2. **Check Email:**
   - Email should arrive within 5-30 seconds (with custom SMTP)
   - Check spam folder if delayed
   - Default Supabase email can take 30-60 seconds

3. **Click Reset Link:**
   - Should redirect to: `http://localhost:3000/auth/callback#access_token=...&type=recovery`
   - Then automatically redirect to: `http://localhost:3000/reset-password`
   - Form should display properly

4. **Reset Password:**
   - Enter new password
   - Confirm password
   - Submit form
   - Should show success message and redirect to login

### Troubleshooting Email Delays

If emails are still delayed:

1. **Check Supabase Email Logs:**
   - Go to **Authentication** → **Logs**
   - Filter by email events
   - Look for rate limit errors

2. **Verify Email Settings:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM auth.config;
   ```

3. **Test with Different Email Providers:**
   - Gmail: Usually fast
   - Outlook: Can be slower
   - Custom domain: Depends on spam filters

4. **Enable SMTP (Production):**
   - Supabase's default email service has rate limits
   - Custom SMTP providers are much faster
   - Recommended for production use

## Email Delivery Time Expectations

| Configuration | Expected Delay | Notes |
|--------------|----------------|-------|
| Supabase Default (Dev) | 30-90 seconds | Rate limited, shared infrastructure |
| Supabase Default (Prod) | 10-30 seconds | Better but still shared |
| Custom SMTP (SendGrid) | 2-10 seconds | Fast, reliable |
| Custom SMTP (AWS SES) | 2-15 seconds | Highly scalable |
| Custom SMTP (Resend) | 1-5 seconds | Developer-friendly |

## Security Best Practices

1. **Token Expiration:**
   - Default: 1 hour (3600 seconds)
   - Configure in Auth settings if needed

2. **Rate Limiting:**
   - Keep enabled to prevent abuse
   - Adjust based on legitimate use patterns

3. **Email Verification:**
   - Always verify email ownership
   - Required before allowing password reset

4. **HTTPS Only:**
   - Use HTTPS in production
   - Configure in Supabase Site URL settings

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Rate Limiting](https://supabase.com/docs/guides/auth/rate-limits)

## Summary

✅ **Fixed**: Password reset redirect issue - now properly shows reset form
⚙️ **Configuration Required**: Follow steps above to reduce email delays
🚀 **Recommended**: Set up custom SMTP for production to eliminate delays
