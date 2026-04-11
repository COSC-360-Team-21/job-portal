import { validationResult } from 'express-validator';
import User from '../models/User.js';

const JOBSEEKER_ALLOWED = [
  'name',
  'profile.phone',
  'profile.location',
  'profile.bio',
  'profile.headline',
  'profile.skills',
  'profile.preferredIndustries',
];

const EMPLOYER_ALLOWED = [
  'name',
  'profile.phone',
  'profile.contactEmail',
  'profile.companyName',
  'profile.companyDescription',
  'profile.industry',
  'profile.companySize',
  'profile.websiteUrl',
  'profile.companyLocation',
  'profile.companyLogoUrl',
];

function buildUpdate(body, allowedKeys) {
  const update = {};

  for (const key of allowedKeys) {
    const [top, sub] = key.split('.');

    if (sub) {
      if (body[top] !== undefined && body[top][sub] !== undefined) {
        update[key] = body[top][sub];
      }
    } else if (body[top] !== undefined) {
      update[top] = body[top];
    }
  }

  return update;
}

export const getProfile = (req, res) => {
  const { _id: id, name, email, role, profile, createdAt } = req.user;
  res.json({ id, name, email, role, profile: profile ?? {}, createdAt });
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const allowed = req.user.role === 'employer' ? EMPLOYER_ALLOWED : JOBSEEKER_ALLOWED;
  const update = buildUpdate(req.body, allowed);

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    const { _id: id, name, email, role, profile, createdAt } = user;
    res.json({ id, name, email, role, profile: profile ?? {}, createdAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};