# GreenVerse Email Templates for Supabase

Custom-branded email templates for Supabase authentication flows, designed to match the GreenVerse environmental theme.

## Templates Included

| Template | File | Supabase Setting |
|----------|------|------------------|
| Confirm Signup | `confirm-signup.html` | Auth → Email Templates → Confirm signup |
| Password Reset | `reset-password.html` | Auth → Email Templates → Reset password |
| Magic Link | `magic-link.html` | Auth → Email Templates → Magic link |
| Invite User | `invite-user.html` | Auth → Email Templates → Invite user |
| Change Email | `change-email.html` | Auth → Email Templates → Change email address |

## How to Install

### 1. Access Supabase Dashboard
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Navigate to **Authentication** → **Email Templates**

### 2. Configure Each Template

For each template:

1. Click on the template type (e.g., "Confirm signup")
2. Copy the entire HTML content from the corresponding `.html` file
3. Paste it into the "Body" field
4. Update the "Subject" field as suggested below

### 3. Recommended Email Subjects

| Template | Subject Line |
|----------|--------------|
| Confirm Signup | `🌱 Welcome to GreenVerse - Confirm Your Email` |
| Password Reset | `🔐 Reset Your GreenVerse Password` |
| Magic Link | `✨ Your GreenVerse Magic Link` |
| Invite User | `🌍 You're Invited to Join GreenVerse!` |
| Change Email | `📧 Confirm Your New Email - GreenVerse` |

## Template Variables

These templates use Supabase's default template variables:

- `{{ .ConfirmationURL }}` - The confirmation/action URL
- `{{ .Token }}` - The token (if needed separately)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

## Design Features

- **Brand Colors**: Emerald green gradient (#10b981 → #059669)
- **Responsive**: Mobile-friendly table-based layout
- **Accessible**: Proper contrast ratios and semantic structure
- **Consistent**: Wangari Maathai quote in footer
- **Secure**: Security notices where appropriate

## Customization

### Change Brand Colors
Replace these color codes throughout:
- Primary gradient: `#10b981` and `#059669`
- Light green background: `#ecfdf5`
- Dark green text: `#065f46` and `#047857`

### Update Site Name
Search and replace "GreenVerse" with your site name.

### Modify Footer Quote
Update the Wangari Maathai quote in the footer section if desired.

## Testing

1. After setting up templates, use Supabase's "Send test email" feature
2. Check rendering in different email clients (Gmail, Outlook, Apple Mail)
3. Test on mobile devices

## Troubleshooting

**Emails not sending?**
- Check Supabase email settings under Auth → Settings
- Verify SMTP configuration if using custom SMTP
- Check email rate limits

**Styling looks broken?**
- Ensure all CSS is inline (already done in these templates)
- Some email clients strip certain styles - test thoroughly

---

*Inspired by Wangari Maathai's Green Belt Movement* 🌳
