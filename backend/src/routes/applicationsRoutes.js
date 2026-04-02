import { Router } from 'express';
import { param } from 'express-validator';
import {
  upload,
  submitApplication,
  getMyApplications,
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

router.get('/my', protect, authorizeRoles('jobseeker'), getMyApplications);

router.patch(
  '/:id/status',
  protect,
  authorizeRoles('employer'),
  [param('id').isMongoId().withMessage('Invalid application id')],
  updateApplicationStatus
);

export default router;
