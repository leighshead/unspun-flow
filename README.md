# Unspun Media Annotation System

A cloud-native annotation workflow system for sentence-level media bias detection with dual-annotator verification.

## 🚀 Deploy to Vercel (Super Easy!)

**Just push your code and Vercel does everything else.** No complex config, no build errors.

### Quick Start (3 minutes total):

1. **Set up Supabase** (2 min)
   - Go to [supabase.com](https://supabase.com) → Create new project
   - SQL Editor → Paste & run `supabase/migrations/20250101000000_initial_schema.sql`
   - Copy your Project URL and anon key from Settings → API

2. **Deploy to Vercel** (30 sec)
   - Go to [vercel.com](https://vercel.com) → Import Git Repository
   - Select your repo → Vercel auto-detects Next.js
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - Click **Deploy** → Done!

3. **Create Users** (30 sec)
   - Supabase → Auth → Add user
   - Table Editor → profiles → Insert row with user ID and role

**Live in 3 minutes!** See [DEPLOY.md](DEPLOY.md) for detailed instructions.

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
