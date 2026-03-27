import { Router } from 'express';
import { upload, submitApplication } from '../controllers/applicationsController.js';

const router = Router();

router.post(
  '/',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ]),
  submitApplication
);

export default router;
