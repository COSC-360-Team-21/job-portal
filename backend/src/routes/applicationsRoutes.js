import { Router } from 'express';
import { body, param, query } from 'express-validator';
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
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.'),
    body('phone').trim().notEmpty().withMessage('Phone is required.')
      .matches(/^\+?[\d\s\-().]{7,15}$/).withMessage('Please provide a valid phone number.'),
    body('jobId').trim().notEmpty().withMessage('Job ID is required.')
      .isMongoId().withMessage('Invalid job ID format.'),
    body('resume').custom((_, { req }) => {
      if (!req.files?.resume?.[0]) throw new Error('Resume is required.');
      return true;
    }),
  ],
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
