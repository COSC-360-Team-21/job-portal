import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { body } from 'express-validator';
import { register, login, getMe, changePassword } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

const uploadDir = 'uploads';
mkdirSync(uploadDir, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/register',
  uploadImage.single('profileImage'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  changePassword
);

export default router;
