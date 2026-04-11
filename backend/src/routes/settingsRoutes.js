import { Router } from 'express';
import { body } from 'express-validator';
import protect from '../middleware/authMiddleware.js';
import { updateEmail, deleteAccount } from '../controllers/settingsController.js';

const router = Router();

router.put(
  '/email',
  protect,
  [
    body('newEmail').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  updateEmail
);

router.delete(
  '/account',
  protect,
  [body('password').notEmpty().withMessage('Password is required')],
  deleteAccount
);

export default router;
