import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createComment,
  getJobComments,
  getUserComments,
  deleteComment,
  getHotDiscussions,
} from '../controllers/commentController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
];

router.get('/hot', getHotDiscussions);

router.get(
  '/job/:jobId',
  [param('jobId').isMongoId().withMessage('Invalid job id'), ...paginationRules],
  getJobComments
);

router.post(
  '/',
  protect,
  [
    body('jobId').isMongoId().withMessage('Invalid job id'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 2000 })
      .withMessage('Comment cannot exceed 2000 characters'),
    body('parentCommentId').optional().isMongoId().withMessage('Invalid parent comment id'),
  ],
  createComment
);

router.get('/mine', protect, [...paginationRules], getUserComments);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid comment id')],
  deleteComment
);

export default router;
