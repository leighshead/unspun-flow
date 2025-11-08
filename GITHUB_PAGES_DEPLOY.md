# 🚀 Deploy to GitHub Pages (3 Minutes)

This app deploys **automatically** to GitHub Pages when you push to your repository.

## Step 1: Set up Supabase Database (2 minutes)

1. Go to **[supabase.com](https://supabase.com)** and sign in
2. Click **"New Project"**
3. Choose:
   - **Name**: `unspun-annotation`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes

5. Once ready, click **SQL Editor** (left sidebar)
6. Click **"New Query"**
7. Copy the **entire contents** of `supabase/migrations/20250101000000_initial_schema.sql`
8. Paste into the SQL Editor
9. Click **"Run"** (bottom right)

10. Click **Project Settings** (gear icon, bottom left)
11. Click **API** tab
12. **Copy these 2 values**:
    - **Project URL** (looks like: `https://xxxxx.supabase.co`)
    - **anon public** key (under "Project API keys")

## Step 2: Configure GitHub Secrets (30 seconds)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [paste your Project URL]
   ```

4. Click **"New repository secret"** again:

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [paste your anon key]
   ```

## Step 3: Enable GitHub Pages (30 seconds)

1. Still in your repo **Settings**
2. Click **Pages** (left sidebar)
3. Under "Source", select **GitHub Actions**
4. That's it!

## Step 4: Deploy! (Automatic)

1. Push your code to GitHub (if you haven't already):
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push origin main
   ```

2. GitHub will automatically:
   - Build your Next.js app
   - Export as static site
   - Deploy to GitHub Pages

3. Check the deployment:
   - Go to **Actions** tab in your repo
   - You'll see "Deploy to GitHub Pages" workflow running
   - Takes ~2-3 minutes

4. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/unspun-flow/
   ```

## Step 5: Create Users (2 minutes)

**In Supabase Dashboard:**

1. Click **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
4. **Copy the UUID** shown

5. Click **Table Editor** → **profiles** → **"Insert row"**
6. Fill in:
   - **id**: Paste the UUID
   - **name**: `Admin User`
   - **role**: Select `admin`
   - **status**: Select `active`
7. Click **"Save"**

Repeat for annotators (with `role: annotator`)

## Step 6: Test Your Live App! 🎊

1. Go to `https://YOUR_USERNAME.github.io/unspun-flow/`
2. Login with `admin@test.com` / `TestPassword123!`
3. You'll see the Admin Dashboard!

## Automatic Updates

Every time you push to your repository, GitHub will automatically rebuild and redeploy your site. No manual deployment needed!

## What You Have Now:

✅ **Live annotation system** on GitHub Pages (FREE!)
✅ **Automatic deployments** on every push
✅ **No server costs** - completely static
✅ **Global CDN** - fast worldwide
✅ **HTTPS** - secure by default
✅ **Custom domain** - add your own domain if you want

## Troubleshooting

**"Page not found"**
→ Make sure GitHub Pages is set to "GitHub Actions" source

**"Failed to build"**
→ Check that you added both secrets (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)

**"Invalid login"**
→ Make sure you created the user in BOTH Supabase Auth AND profiles table

**Deployment stuck**
→ Check the Actions tab for error logs

## Optional: Custom Domain

1. In GitHub repo Settings → Pages
2. Enter your custom domain
3. Follow the DNS setup instructions
4. Your app will be at `https://yourdomain.com`!

---

**That's it!** Your annotation system is now live and will auto-deploy on every push. 🎉
