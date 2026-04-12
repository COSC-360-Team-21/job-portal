import { Router } from 'express';
import { body } from 'express-validator';
import protect from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();

const updateValidations = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),

  body('profile.phone')
    .optional()
    .matches(/^\+?[\d\s\-().]{7,15}$/)
    .withMessage('Invalid phone number'),

  body('profile.location').optional().isString().trim(),

  body('profile.bio')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('profile.headline')
    .optional()
    .isString()
    .isLength({ max: 120 })
    .withMessage('Headline cannot exceed 120 characters'),

  body('profile.skills').optional().isArray().withMessage('Skills must be an array'),
  body('profile.skills.*').optional().isString().trim(),

  body('profile.preferredIndustries')
    .optional()
    .isArray()
    .withMessage('Preferred industries must be an array'),
  body('profile.preferredIndustries.*').optional().isString().trim(),

  body('profile.contactEmail').optional().isEmail().withMessage('Invalid contact email'),
  body('profile.companyName').optional().isString().trim(),
  body('profile.companyDescription').optional().isString(),
  body('profile.industry').optional().isString().trim(),

  body('profile.companySize')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'])
    .withMessage('Invalid company size'),

  body('profile.websiteUrl').optional().isURL().withMessage('Invalid website URL'),
  body('profile.companyLocation').optional().isString().trim(),
  body('profile.companyLogoUrl').optional().isURL().withMessage('Invalid logo URL'),
];

router.get('/', protect, getProfile);
router.put('/', protect, updateValidations, updateProfile);

export default router;