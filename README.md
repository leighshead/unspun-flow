# Unspun Media Annotation Workflow

A web-based annotation workflow system for sentence-level media bias detection with dual-annotator verification and Claude API integration.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth
- **AI Integration**: Claude API (Anthropic)

## Project Structure

```
unspun-flow/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── shared/            # Shared TypeScript types
├── docker-compose.yml # Docker setup for local development
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Docker and Docker Compose (optional, for containerized setup)

### Option 1: Docker Setup (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Start all services:
   ```bash
   docker-compose up
   ```
4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Option 2: Local Setup

#### Database Setup

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb unspun_annotation
   ```
3. Copy `.env.example` to `.env` and update `DATABASE_URL`

#### Backend Setup

```bash
cd backend
npm install
npm run migrate      # Run database migrations
npm run seed         # (Optional) Seed initial data
npm run dev          # Start development server
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev          # Start development server
```

## Environment Variables

See `.env.example` for all required environment variables.

**Important**:
- Set a strong `JWT_SECRET` in production
- Get an Anthropic API key from https://console.anthropic.com
- Configure SMTP settings for email notifications

## Database Migrations

```bash
cd backend
npm run migrate:create <migration-name>  # Create new migration
npm run migrate                          # Run pending migrations
npm run migrate:rollback                 # Rollback last migration
```

## Features

### Phase 1: Core Infrastructure ✅
- Article ingestion (manual upload)
- Sentence segmentation
- Admin dashboard
- Annotator management

### Phase 2: Annotation Workflow ✅
- Assignment system
- Annotation interface
- Dual-annotator parallel work
- Progress tracking

### Phase 3: Agreement & Review ✅
- Agreement calculation
- Review panel
- Discussion threads
- JSON export

### Phase 4: Claude API Integration ✅
- Pre-annotation suggestions
- Disagreement resolution
- Card text generation
- API usage tracking

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:3000/api-docs

## Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

Proprietary - Unspun Media

## Support

For issues and questions, contact: support@unspun.media
