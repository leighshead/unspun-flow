import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import {
  createArticle,
  getArticles,
  getArticleById,
  assignAnnotators,
  deleteArticle,
  getDashboardStats,
} from '../controllers/articleController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/stats', getDashboardStats);

// List articles
router.get(
  '/',
  validate([
    queryValidator('status').optional().isIn(['queued', 'assigned', 'in_progress', 'completed', 'needs_review', 'ready_to_publish', 'published']),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
  ]),
  getArticles
);

// Get single article
router.get('/:id', getArticleById);

// Create article (admin only)
router.post(
  '/',
  requireAdmin,
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('source').notEmpty().withMessage('Source is required'),
    body('publicationDate').isISO8601().withMessage('Valid date is required'),
  ]),
  createArticle
);

// Assign annotators (admin only)
router.post(
  '/:id/assign',
  requireAdmin,
  validate([
    body('annotatorIds').isArray({ min: 2, max: 2 }).withMessage('Exactly 2 annotators required'),
    body('dueDate').optional().isISO8601(),
  ]),
  assignAnnotators
);

// Delete article (admin only)
router.delete('/:id', requireAdmin, deleteArticle);

export default router;
