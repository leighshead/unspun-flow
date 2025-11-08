import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  claudeMaxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '2000'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  rateLimits: {
    claudeApiCallsPerMonth: parseInt(process.env.CLAUDE_API_CALLS_PER_MONTH || '1000'),
    claudeApiCallsPerDay: parseInt(process.env.CLAUDE_API_CALLS_PER_DAY || '50'),
  },
};
