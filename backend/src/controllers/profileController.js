import { validationResult } from 'express-validator';
import * as userService from '../services/userService.js';
import { normalizeImagePath } from './authController.js';

export const getProfile = (req, res) => {
  const { _id: id, name, email, role, profile, profileImage, createdAt } = req.user;
  res.json({ id, name, email, role, profileImage: normalizeImagePath(profileImage), profile: profile ?? {}, createdAt });
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await userService.updateProfile(req.user._id, req.user.role, req.body);
    const { _id: id, name, email, role, profile, profileImage, createdAt } = user;
    res.json({ id, name, email, role, profileImage: normalizeImagePath(profileImage), profile: profile ?? {}, createdAt });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image file is required' });

  try {
    const user = await userService.updateProfileImage(req.user._id, req.file.path);
    res.json({ profileImage: normalizeImagePath(user.profileImage) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};