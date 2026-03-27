import { Router } from 'express';
import { param } from 'express-validator';
import {
  upload,
  submitApplication,
  updateApplicationStatus,
} from '../controllers/applicationsController.js';
import protect, { authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ]),
  submitApplication
);

router.patch(
  '/:id/status',
  protect,
  authorizeRoles('employer'),
  [param('id').isMongoId().withMessage('Invalid application id')],
  updateApplicationStatus
);

export default router;
