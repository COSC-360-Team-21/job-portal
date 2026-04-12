import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getStats,
  getActivityByDate,
  getUsers,
  toggleUserActive,
  deleteUser,
  getJobs,
  deleteJob,
  setJobStatus,
  getApplications,
} from '../controllers/adminController.js';
import protect, { authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, authorizeRoles('admin'));

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer greater than or equal to 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be an integer between 1 and 100'),
];

router.get('/stats', getStats);

router.get(
  '/activity',
  [query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be 1-365')],
  getActivityByDate
);

router.get(
  '/users/:id?',
  [
    param('id').optional().isMongoId().withMessage('Invalid user id'),
    query('q').optional().isString().trim(),
    query('role').optional().isIn(['jobseeker', 'employer', 'admin']).withMessage('Invalid role'),
    ...paginationRules,
  ],
  getUsers
);

router.patch(
  '/users/:id/toggle-active',
  [param('id').isMongoId().withMessage('Invalid user id')],
  toggleUserActive
);

router.delete('/users/:id', [param('id').isMongoId().withMessage('Invalid user id')], deleteUser);

router.get(
  '/jobs',
  [
    query('q').optional().isString().trim(),
    query('status').optional().isIn(['active', 'closed']).withMessage('status must be active or closed'),
    query('workType')
      .optional()
      .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .withMessage('Invalid work type'),
    ...paginationRules,
  ],
  getJobs
);

router.delete('/jobs/:id', [param('id').isMongoId().withMessage('Invalid job id')], deleteJob);

router.patch(
  '/jobs/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid job id'),
    body('status').notEmpty().isIn(['active', 'closed']).withMessage('status must be active or closed'),
  ],
  setJobStatus
);

router.get(
  '/applications',
  [
    query('status')
      .optional()
      .isIn(['pending', 'reviewed', 'shortlisted', 'rejected'])
      .withMessage('Invalid status'),
    ...paginationRules,
  ],
  getApplications
);

export default router;
