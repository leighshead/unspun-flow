import express from 'express';
import { body } from 'express-validator';
import {
  getAnnotators,
  getAnnotatorById,
  getAnnotatorAssignments,
  updateAnnotator,
} from '../controllers/annotatorController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnotators);
router.get('/:id', getAnnotatorById);
router.get('/:id/assignments', getAnnotatorAssignments);

router.put(
  '/:id',
  requireAdmin,
  validate([
    body('name').optional().notEmpty(),
    body('status').optional().isIn(['active', 'inactive']),
  ]),
  updateAnnotator
);

export default router;
