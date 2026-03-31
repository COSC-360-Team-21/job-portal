import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  upload,
  submitApplication,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
} from '../controllers/applicationsController.js';
import protect, { authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/',
  protect,
  authorizeRoles('jobseeker'),
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ]),
  submitApplication
);

router.get('/mine', protect, authorizeRoles('jobseeker'), getMyApplications);

router.get(
  '/received',
  protect,
  authorizeRoles('employer'),
  [
    query('applicationStatus')
      .optional()
      .isIn(['pending', 'reviewed', 'shortlisted', 'rejected'])
      .withMessage('Invalid applicationStatus'),
    query('jobId').optional().isMongoId().withMessage('Invalid jobId'),
    query('search').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100').toInt(),
  ],
  getReceivedApplications
);

router.patch(
  '/:id/status',
  protect,
  authorizeRoles('employer'),
  [param('id').isMongoId().withMessage('Invalid application id')],
  updateApplicationStatus
);

export default router;
