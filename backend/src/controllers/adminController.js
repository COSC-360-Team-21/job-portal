import { validationResult } from 'express-validator';
import * as adminService from '../services/adminService.js';

export const getStats = async (_req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActivityByDate = async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days, 10) || 30;
    const data = await adminService.getActivityByDate(days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (req.params.id) {
      const user = await adminService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    const result = await adminService.getUsers(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleUserActive = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await adminService.toggleUserActive(req.params.id);
    res.json({ message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`, isActive: user.isActive });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await adminService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getJobs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await adminService.getAdminJobs(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await adminService.deleteAdminJob(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const setJobStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updated = await adminService.setJobStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getApplications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await adminService.getAdminApplications(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
