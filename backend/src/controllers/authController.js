import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import * as userService from '../services/userService.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage || '',
  profile: user.profile ?? {},
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role } = req.body;
    const profileImage = req.file ? req.file.path : '';

    const user = await userService.registerUser({ name, email, password, role, profileImage });

    res.status(201).json({
      token: generateToken(user._id),
      user: userResponse(user),
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await userService.loginUser(req.body.email, req.body.password);

    res.json({
      token: generateToken(user._id),
      user: userResponse(user),
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage || '', profile: u.profile ?? {}, createdAt: u.createdAt });
};

export const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await userService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};