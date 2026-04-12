import { validationResult } from 'express-validator';
import * as userService from '../services/userService.js';

export const updateEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await userService.changeEmail(req.user._id, req.body.newEmail, req.body.password);
    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await userService.deleteAccount(req.user._id, req.body.password);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
