# Unspun Media Annotation System

A cloud-native annotation workflow system for sentence-level media bias detection with dual-annotator verification.

## 🚀 Deploy to Production (5 minutes)

### Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **SQL Editor** and run the migration:
   - Copy the contents of `supabase/migrations/20250101000000_initial_schema.sql`
   - Paste and execute in SQL Editor
4. Go to **Project Settings** → **API** and copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" and select your repository
4. Vercel will auto-detect Next.js
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
6. Click **Deploy**
7. Your app will be live in ~2 minutes!

### Step 3: Create Users

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Add email and password (e.g., `admin@test.com` / `password123`)
4. Copy the user's UUID
5. Go to **Table Editor** → **profiles** → **Insert row**:
   ```
   id: [paste UUID]
   name: Admin User
   role: admin
   status: active
   ```
6. Repeat for annotators (with `role: annotator`)

### Step 4: Test the App

1. Visit your Vercel URL
2. Login with the credentials you created
3. Admins will see the admin dashboard
4. Annotators will see their assignments

## 📊 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **NLP**: compromise.js

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

## ✨ Features

- **Admin Dashboard**: Create articles, view stats, manage annotators
- **Annotation Interface**: Sentence-by-sentence bias detection
- **Dual Annotator System**: Assign 2 annotators per article
- **6 Bias Types**: Loaded Language, Framing, Source Imbalance, Speculation, Omission, Neutral
- **Real-time Updates**: Powered by Supabase
- **Serverless**: No server management, auto-scaling
- **Mobile Responsive**: Works on all devices

## 📝 Usage

### As Admin

1. **Create Article**: Click "Add Article", paste content
2. **Assign Annotators**: Go to article, assign 2 annotators
3. **Monitor Progress**: View real-time stats on dashboard
4. **Export Data**: Download JSON when annotations complete

### As Annotator

1. **View Assignments**: See articles assigned to you
2. **Annotate**: Click "Start Annotating"
3. **Select Bias**: Choose bias type(s) and confidence
4. **Add Notes**: Optional reasoning for your choice
5. **Progress**: Track completion percentage

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Admins can only create/update articles
- Annotators can only see their assignments
- Users can only update their own annotations
- All API routes protected by Supabase Auth

## 📈 Scaling

- Vercel automatically scales API routes
- Supabase handles 500GB storage on free tier
- Upgrade to Pro for unlimited scaling

## 🐛 Troubleshooting

**"Failed to fetch"**: Check Supabase URL and API keys in env variables

**"User not found"**: Create user in Supabase Auth, then add profile

**"RLS policy violation"**: Ensure profile exists for authenticated user

**Build errors**: Run `npm install` and verify Next.js 14 is installed

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

## 🤝 Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase logs in dashboard
- Check Vercel deployment logs

## 📄 License

Proprietary - Unspun Media
