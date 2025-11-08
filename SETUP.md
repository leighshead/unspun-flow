# Unspun Media Annotation System - Setup Guide

This guide will walk you through setting up and running the annotation system locally.

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 15+ (or use Docker)
- **Git**

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# 1. Clone and navigate to the project
cd unspun-flow

# 2. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker-compose up

# 4. In a new terminal, run migrations and seed data
docker exec -it unspun_backend npm run migrate
docker exec -it unspun_backend npm run seed
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

## Manual Setup (Without Docker)

### 1. Database Setup

Install PostgreSQL and create a database:

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb unspun_annotation

# Or using psql
psql postgres
CREATE DATABASE unspun_annotation;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and update DATABASE_URL
# DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/unspun_annotation

# Run database migrations
npm run migrate

# Seed initial data (admin user and sample data)
npm run seed

# Start backend server
npm run dev
```

The backend will run on http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

## Default Login Credentials

After running the seed script, you can login with:

**Admin Account:**
- Email: `admin@unspun.media`
- Password: `admin123`

**Annotator Accounts:**
- Email: `sarah@unspun.media`
- Password: `password123`

- Email: `michael@unspun.media`
- Password: `password123`

## Environment Configuration

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unspun_annotation

# Authentication
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRY=7d

# Claude API (optional - for AI features)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## Testing the System

### 1. Login as Admin

1. Go to http://localhost:5173
2. Login with admin credentials
3. You should see the Admin Dashboard

### 2. Create an Article

1. Click "Add Article" button
2. Fill in the form:
   - Title: "Test Article"
   - URL: "https://example.com/test"
   - Source: "Test News"
   - Publication Date: Today's date
   - Content: Paste some sample text (multiple sentences)
3. Click "Create Article"

### 3. Login as Annotator

1. Logout and login as `sarah@unspun.media`
2. You should see "No Assignments Yet"
3. Logout and login back as admin

### 4. Assign Article to Annotators

Currently, you need to use the API directly to assign annotators:

```bash
# Get article ID from the dashboard
# Get annotator IDs from the database or API

curl -X POST http://localhost:3000/api/articles/{ARTICLE_ID}/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "annotatorIds": ["ANNOTATOR_1_ID", "ANNOTATOR_2_ID"]
  }'
```

Note: The UI for assigning annotators will be added in the next iteration.

### 5. Annotate Article

1. Login as annotator (sarah@unspun.media)
2. You should see the assigned article
3. Click "Start Annotating"
4. For each sentence:
   - Select bias type(s)
   - Choose confidence level
   - Add notes (optional)
   - Click "Save & Next"

## Database Migrations

### Create a New Migration

```bash
cd backend
npm run migrate:create migration_name
```

### Run Migrations

```bash
cd backend
npm run migrate
```

### Rollback Last Migration

```bash
cd backend
npm run migrate:rollback
```

## API Documentation

### Authentication

**POST /api/auth/login**
```json
{
  "email": "admin@unspun.media",
  "password": "admin123"
}
```

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "bio": "Optional bio"
}
```

### Articles

**GET /api/articles** - List all articles
**GET /api/articles/:id** - Get single article with sentences
**POST /api/articles** - Create new article (admin only)
**POST /api/articles/:id/assign** - Assign annotators (admin only)
**DELETE /api/articles/:id** - Delete article (admin only)
**GET /api/articles/stats** - Get dashboard stats

### Annotators

**GET /api/annotators** - List all annotators
**GET /api/annotators/:id** - Get annotator details
**GET /api/annotators/:id/assignments** - Get annotator's assignments
**PUT /api/annotators/:id** - Update annotator (admin only)

### Annotations

**POST /api/annotations** - Create annotation
**POST /api/annotations/bulk** - Save multiple annotations
**GET /api/annotations/sentences/:sentenceId** - Get sentence annotations
**GET /api/annotations/articles/:articleId/agreement** - Get agreement score

**POST /api/annotations/discussions** - Add discussion comment
**GET /api/annotations/discussions/:sentenceId** - Get discussion thread

### Claude API (Optional)

**POST /api/claude/suggest** - Get AI bias suggestion
**POST /api/claude/resolve** - Get resolution help
**POST /api/claude/generate-card** - Generate social media card

## Troubleshooting

### Database Connection Errors

1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Check database credentials in `.env`

3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

Or change the port in `.env` files.

### Migration Errors

If migrations fail:

```bash
# Reset database (WARNING: This deletes all data)
dropdb unspun_annotation
createdb unspun_annotation
npm run migrate
npm run seed
```

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Next Steps

After completing the basic setup, you can:

1. **Add more annotators**: Use the register endpoint or create them directly in the database
2. **Configure Claude API**: Add your Anthropic API key to enable AI features
3. **Customize bias taxonomy**: Modify the bias types in the frontend and backend
4. **Add agreement review UI**: Build the comparison panel for reviewing disagreements
5. **Implement export functionality**: Add JSON export for completed articles

## Development Workflow

### Backend Changes

1. Make changes to backend code
2. Server auto-restarts (nodemon)
3. Test API endpoints

### Frontend Changes

1. Make changes to frontend code
2. Vite hot-reloads automatically
3. View changes in browser

### Database Changes

1. Create new migration file
2. Write SQL for changes
3. Run migration
4. Test changes

## Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) (coming soon).

Key considerations:
- Use strong JWT_SECRET
- Enable SSL/HTTPS
- Set NODE_ENV=production
- Use managed PostgreSQL (e.g., Supabase, Railway)
- Configure CORS properly
- Set up monitoring and logging
- Implement rate limiting

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review the technical specification
- Check GitHub issues

## License

Proprietary - Unspun Media
