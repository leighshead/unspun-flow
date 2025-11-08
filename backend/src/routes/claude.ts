import express from 'express';
import { body } from 'express-validator';
import { suggest, resolve, generateCard } from '../controllers/claudeController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.use(authenticate);

router.post(
  '/suggest',
  validate([
    body('sentence').notEmpty().withMessage('Sentence is required'),
  ]),
  suggest
);

router.post(
  '/resolve',
  validate([
    body('sentence').notEmpty().withMessage('Sentence is required'),
    body('annotatorA').isObject().withMessage('Annotator A data is required'),
    body('annotatorB').isObject().withMessage('Annotator B data is required'),
  ]),
  resolve
);

router.post(
  '/generate-card',
  validate([
    body('articleTitle').notEmpty().withMessage('Article title is required'),
    body('source').notEmpty().withMessage('Source is required'),
    body('biasFindings').notEmpty().withMessage('Bias findings are required'),
  ]),
  generateCard
);

export default router;
