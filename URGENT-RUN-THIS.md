# 🚨 URGENT: Run These SQLs in Order

## Step 1: Drop ALL Triggers
Run `database-drop-all-story-triggers.sql` first

This will:
- Find and drop ALL triggers on stories table
- Drop all trigger functions
- Show you which triggers were dropped

## Step 2: Setup Everything
Run `database-stories-setup.sql`

This will:
- Create tables
- Add missing columns
- Create correct trigger
- Setup RLS policies

## Step 3: Push to GitHub
```bash
git push origin main
```

## Step 4: Test
- Go to Impact Stories
- Upload and submit
- Should work!

---
**Run Step 1 FIRST, then Step 2!**
