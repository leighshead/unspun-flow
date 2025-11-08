import express from 'express';
import { body } from 'express-validator';
import {
  createAnnotation,
  bulkSaveAnnotations,
  getSentenceAnnotations,
  getArticleAgreement,
  createDiscussion,
  getSentenceDiscussions,
} from '../controllers/annotationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.use(authenticate);

// Annotations
router.post(
  '/',
  validate([
    body('sentenceId').isUUID().withMessage('Valid sentence ID required'),
    body('biasTags').isArray().withMessage('Bias tags must be an array'),
    body('confidence').isIn(['high', 'medium', 'low']).withMessage('Valid confidence level required'),
  ]),
  createAnnotation
);

router.post(
  '/bulk',
  validate([
    body('annotations').isArray().withMessage('Annotations must be an array'),
  ]),
  bulkSaveAnnotations
);

router.get('/sentences/:sentenceId', getSentenceAnnotations);

// Agreement
router.get('/articles/:articleId/agreement', getArticleAgreement);

// Discussions
router.post(
  '/discussions',
  validate([
    body('sentenceId').isUUID().withMessage('Valid sentence ID required'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ]),
  createDiscussion
);

router.get('/discussions/:sentenceId', getSentenceDiscussions);

export default router;
