import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { createJob, getJobs, getMyJobs, updateJob, deleteJob } from '../controllers/jobsController.js';
import protect, { authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/',
  protect,
  authorizeRoles('employer'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('workType')
      .notEmpty()
      .withMessage('Work type is required')
      .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .withMessage('Invalid work type'),
  ],
  createJob
);

router.get(
  '/',
  [
    query('q').optional().isString().trim(),
    query('location').optional().isString().trim(),
    query('workType')
      .optional()
      .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .withMessage('Invalid work type'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be an integer greater than or equal to 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be an integer between 1 and 100'),
  ],
  getJobs
);

router.get(
  '/mine',
  protect,
  authorizeRoles('employer'),
  [
    query('q').optional().isString().trim(),
    query('status')
      .optional()
      .isIn(['active', 'closed'])
      .withMessage('status must be active or closed'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be an integer greater than or equal to 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be an integer between 1 and 100'),
  ],
  getMyJobs
);

router.put(
  '/:id',
  protect,
  authorizeRoles('employer'),
  [
    param('id').isMongoId().withMessage('Invalid job id'),
    body('workType')
      .optional()
      .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .withMessage('Invalid work type'),
  ],
  updateJob
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('employer'),
  [param('id').isMongoId().withMessage('Invalid job id')],
  deleteJob
);

export default router;
