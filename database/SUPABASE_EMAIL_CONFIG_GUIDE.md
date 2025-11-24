# Supabase Email Configuration Guide

## Overview
This guide provides step-by-step instructions to properly configure password reset and other email templates in your Supabase project.

## Your Project Details
- **Project ID**: `hhtiutkjtfchqpgplblp`
- **Project Name**: MIC (Maathai Innovation Catalyst)
- **Supabase URL**: `https://hhtiutkjtfchqpgplblp.supabase.co`
- **Region**: eu-west-1

## Step 1: Configure Site URL and Redirect URLs

### Access URL Configuration
1. Go to: https://supabase.com/dashboard/project/hhtiutkjtfchqpgplblp/auth/url-configuration
2. Or navigate to: **Authentication** → **URL Configuration**

### Set Site URL
Set your **Site URL** to your production domain:
```
Production: https://your-production-domain.com
```

For local development, you can temporarily set it to:
```
Local: http://localhost:5173
```

### Add Redirect URLs
Add ALL of the following URLs to the **Redirect URLs** list:

**For Local Development:**
```
http://localhost:5173/**
http://localhost:5173/reset-password
http://localhost:5173/auth/callback
http://localhost:3000/**
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

**For Production (replace with your actual domain):**
```
https://your-production-domain.com/**
https://your-production-domain.com/reset-password
https://your-production-domain.com/auth/callback
```

**Important Notes:**
- The `**` wildcard is crucial for local development
- Each URL must be added separately using the "Add URL" button
- Make sure to click "Save" after adding all URLs

## Step 2: Configure Email Templates

### Access Email Templates
1. Go to: https://supabase.com/dashboard/project/hhtiutkjtfchqpgplblp/auth/templates
2. Or navigate to: **Authentication** → **Email Templates**

### Password Reset Template

Click on **"Reset Password"** template and use the following configuration:

**Subject:**
```
Reset Your Password - Maathai Innovation Catalyst
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 12px;
      color: #6b7280;
    }
    .code-box {
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 20px 0;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #059669;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌿 Reset Your Password</h1>
  </div>
  
  <div class="content">
    <h2>Hello!</h2>
    <p>We received a request to reset your password for your Maathai Innovation Catalyst account.</p>
    
    <p>Click the button below to create a new password:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    </div>
    
    <p><strong>Or use this verification code:</strong></p>
    <div class="code-box">{{ .Token }}</div>
    
    <p><strong>Important:</strong></p>
    <ul>
      <li>This link will expire in 1 hour</li>
      <li>If you didn't request this reset, please ignore this email</li>
      <li>Your password won't change until you create a new one</li>
    </ul>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280; font-size: 12px;">{{ .ConfirmationURL }}</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by Maathai Innovation Catalyst</p>
    <p>If you have any questions, please contact our support team.</p>
  </div>
</body>
</html>
```

### Confirm Signup Template

Click on **"Confirm Signup"** template:

**Subject:**
```
Welcome to Maathai Innovation Catalyst - Confirm Your Email
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌿 Welcome to Maathai Innovation Catalyst!</h1>
  </div>
  
  <div class="content">
    <h2>Hello {{ .Data.full_name }}!</h2>
    <p>Thank you for joining the Maathai Innovation Catalyst community. We're excited to have you on board!</p>
    
    <p>Please confirm your email address to activate your account:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>
    </div>
    
    <p><strong>What you can do with your account:</strong></p>
    <ul>
      <li>Join and create environmental campaigns</li>
      <li>Participate in community discussions</li>
      <li>Share your environmental stories</li>
      <li>Connect with like-minded individuals</li>
    </ul>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280; font-size: 12px;">{{ .ConfirmationURL }}</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by Maathai Innovation Catalyst</p>
    <p>If you didn't create this account, please ignore this email.</p>
  </div>
</body>
</html>
```

### Magic Link Template

Click on **"Magic Link"** template:

**Subject:**
```
Your Magic Link - Maathai Innovation Catalyst
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 12px;
      color: #6b7280;
    }
    .code-box {
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 20px 0;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #059669;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌿 Your Magic Link</h1>
  </div>
  
  <div class="content">
    <h2>Hello!</h2>
    <p>Click the button below to securely log in to your Maathai Innovation Catalyst account:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Log In</a>
    </div>
    
    <p><strong>Or use this verification code:</strong></p>
    <div class="code-box">{{ .Token }}</div>
    
    <p><strong>Security Note:</strong></p>
    <ul>
      <li>This link will expire in 1 hour</li>
      <li>If you didn't request this login link, please ignore this email</li>
    </ul>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280; font-size: 12px;">{{ .ConfirmationURL }}</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by Maathai Innovation Catalyst</p>
    <p>For security reasons, never share this link with anyone.</p>
  </div>
</body>
</html>
```

## Step 3: Test the Configuration

### Testing Password Reset Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the forgot password page:**
   ```
   http://localhost:5173/forgot-password
   ```

3. **Enter your email address:**
   ```
   aoluoch271@gmail.com
   ```

4. **Check your email inbox** (and spam folder)

5. **Click the reset link** or enter the OTP code

6. **Create a new password** on the reset page

7. **Verify you can log in** with the new password

### Debugging Tips

If the reset link doesn't work:

1. **Check browser console** (F12 → Console tab) for errors

2. **Verify the URL** contains these parameters:
   - `access_token` or `token_hash`
   - `type=recovery`

3. **Check Supabase Auth Logs:**
   - Go to: https://supabase.com/dashboard/project/hhtiutkjtfchqpgplblp/logs/auth-logs
   - Look for any errors or failed attempts

4. **Use the debug page:**
   - Replace `/reset-password` with `/debug-reset-password` in the URL
   - This will show you all the parameters and help diagnose issues

## Step 4: Update Production URLs

When you deploy to production:

1. **Update Site URL** in Supabase Dashboard to your production domain

2. **Add production redirect URLs:**
   ```
   https://your-production-domain.com/**
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/auth/callback
   ```

3. **Keep localhost URLs** for continued local development

4. **Test the flow** in production environment

## Common Issues and Solutions

### Issue: "Invalid or expired reset link"

**Causes:**
- Redirect URL not configured in Supabase
- Link expired (>1 hour old)
- Link already used (single-use only)

**Solutions:**
- Add redirect URLs as described in Step 1
- Request a new reset link
- Check that Site URL matches your domain

### Issue: Token not found in URL

**Causes:**
- Email template doesn't use `{{ .ConfirmationURL }}`
- Browser/email client modifying the link

**Solutions:**
- Verify email template uses correct variables
- Try copying the link manually instead of clicking
- Use the OTP code instead of the link

### Issue: CORS errors

**Causes:**
- Domain not allowed in Supabase

**Solutions:**
- Go to: Settings → API → CORS Allowed Origins
- Add your domain (e.g., `http://localhost:5173`)

## Email Template Variables Reference

Use these variables in your email templates:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Full confirmation URL with token |
| `{{ .Token }}` | 6-digit OTP code |
| `{{ .TokenHash }}` | Hashed token for custom URLs |
| `{{ .SiteURL }}` | Your configured Site URL |
| `{{ .RedirectTo }}` | Custom redirect URL if provided |
| `{{ .Email }}` | User's email address |
| `{{ .Data.full_name }}` | User's full name from metadata |
| `{{ .Data.username }}` | User's username from metadata |

## Security Best Practices

1. **Always use HTTPS** in production
2. **Set appropriate token expiry** (default 1 hour is good)
3. **Enable email confirmation** for new signups
4. **Use strong password requirements** (already implemented in your app)
5. **Monitor auth logs** regularly for suspicious activity
6. **Keep redirect URLs** specific (avoid overly broad wildcards in production)

## Support

If you continue to experience issues:

1. Check the Supabase Auth Logs
2. Review browser console errors
3. Test with the debug page
4. Verify all configuration steps were completed
5. Check that environment variables are correct

## Quick Checklist

- [ ] Site URL configured correctly
- [ ] All redirect URLs added (localhost + production)
- [ ] Password reset email template updated
- [ ] Confirm signup email template updated
- [ ] Magic link email template updated
- [ ] Templates saved in Supabase Dashboard
- [ ] Local testing completed successfully
- [ ] Production URLs will be added before deployment

---

**Last Updated:** November 24, 2025
**Project:** Maathai Innovation Catalyst
**Supabase Project ID:** hhtiutkjtfchqpgplblp
