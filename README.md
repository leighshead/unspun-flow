# Unspun Media Annotation System

A cloud-native annotation workflow system for sentence-level media bias detection with dual-annotator verification.

## 🚀 Deploy to GitHub Pages (Auto-Deploy on Push!)

**This app automatically deploys to GitHub Pages** when you push to your repository. See **[GITHUB_PAGES_DEPLOY.md](GITHUB_PAGES_DEPLOY.md)** for the complete 3-minute setup guide.

### Quick Start:

1. **Set up Supabase** (2 min) - Create project, run migration SQL
2. **Add GitHub Secrets** (30 sec) - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Enable GitHub Pages** (30 sec) - Set source to "GitHub Actions"
4. **Push to GitHub** - Automatic deployment!
5. **Create Users** (2 min) - Add users in Supabase Auth + profiles table

Your app will be live at: `https://YOUR_USERNAME.github.io/unspun-flow/`

**Alternative:** You can also deploy to Vercel - see [DEPLOY.md](DEPLOY.md)

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
