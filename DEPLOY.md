# 🚀 Deploy Unspun Annotation System Online (5 Minutes)

This is a **functioning mockup** ready to deploy to production. Follow these steps to get it online.

## Step 1: Set up Supabase Database (2 minutes)

1. Go to **[supabase.com](https://supabase.com)** and sign in
2. Click **"New Project"**
3. Choose:
   - **Name**: `unspun-annotation`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes for database to initialize

5. Once ready, click **SQL Editor** (left sidebar)
6. Click **"New Query"**
7. Open this file in your repo: `supabase/migrations/20250101000000_initial_schema.sql`
8. **Copy the entire contents** and paste into the SQL Editor
9. Click **"Run"** (bottom right)
10. You should see: "Success. No rows returned"

11. Click **Project Settings** (gear icon, bottom left)
12. Click **API** tab
13. **Copy these 3 values** (you'll need them in Step 2):
    - **Project URL** (looks like: `https://xxxxx.supabase.co`)
    - **anon public** key (under "Project API keys")
    - **service_role** key (click "Reveal" first, then copy)

## Step 2: Deploy to Vercel (1 minute)

1. Make sure your code is pushed to GitHub
2. Go to **[vercel.com](https://vercel.com)** and sign in
3. Click **"Add New..."** → **"Project"**
4. Click **"Import"** on your `unspun-flow` repository
5. Vercel will auto-detect Next.js ✅
6. Click **"Environment Variables"** and add these 3:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [paste your Project URL from Step 1]

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [paste your anon key from Step 1]

   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [paste your service_role key from Step 1]
   ```

7. Click **"Deploy"**
8. Wait ~90 seconds
9. Your app is now **LIVE!** 🎉

Click the link Vercel shows you (like `https://unspun-flow.vercel.app`)

## Step 3: Create Your First Users (2 minutes)

**Important:** Supabase Auth requires you to create users manually first.

### Create an Admin User:

1. Go back to **Supabase Dashboard**
2. Click **Authentication** (left sidebar)
3. Click **Users** tab
4. Click **"Add user"** → **"Create new user"**
5. Fill in:
   - **Email**: `admin@test.com` (or your email)
   - **Password**: `TestPassword123!` (or your password)
   - Click **"Create user"**
6. **Copy the UUID** shown (looks like: `a1b2c3d4-...`)

7. Click **Table Editor** (left sidebar)
8. Click **"profiles"** table
9. Click **"Insert"** → **"Insert row"**
10. Fill in:
    - **id**: Paste the UUID you copied
    - **name**: `Admin User`
    - **role**: Select `admin` from dropdown
    - **status**: Select `active` from dropdown
    - Leave **bio** empty
11. Click **"Save"**

### Create an Annotator User (Optional):

Repeat the same process but with:
- **Email**: `annotator@test.com`
- **Password**: `TestPassword123!`
- **role**: Select `annotator` (not admin)

## Step 4: Test Your Live App! 🎊

1. Go to your Vercel URL
2. You'll see the login page
3. Login with:
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
4. You should see the **Admin Dashboard**!

### Try It Out:

1. Click **"Add Article"**
2. Fill in:
   - **Title**: Test Article
   - **URL**: https://example.com/test
   - **Source**: Example News
   - **Date**: Today
   - **Content**: Paste some text with multiple sentences
3. Click **"Create Article"**
4. You'll see it appear in the table!

## What You Have Now:

✅ **Live, functioning annotation system**
✅ **Admin dashboard** for creating articles
✅ **Annotator dashboard** for assignments
✅ **Full annotation interface** with 6 bias types
✅ **Automatic sentence segmentation**
✅ **Secure authentication**
✅ **Auto-scaling database**
✅ **Mobile responsive**
✅ **Free hosting** (on Vercel + Supabase free tiers)

## Next Steps:

1. **Assign articles to annotators** (TODO: Add UI for this)
2. **Login as annotator** and test annotation workflow
3. **Customize** bias types or add more features
4. **Add your team** - create more users in Supabase Auth
5. **Connect custom domain** (in Vercel settings)

## Troubleshooting:

**"Invalid login credentials"**
→ Make sure you created the user in BOTH Auth AND profiles table

**"Failed to fetch"**
→ Check that all 3 environment variables are set correctly in Vercel

**"RLS policy violation"**
→ Make sure the user's UUID in profiles matches the Auth user UUID exactly

**Build failed**
→ Check Vercel build logs, usually missing env variables

## Support:

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Check logs in Supabase → Logs
- Check logs in Vercel → Deployments → [your deployment] → Logs

---

**That's it!** You now have a fully functional media annotation system running online. 🚀
