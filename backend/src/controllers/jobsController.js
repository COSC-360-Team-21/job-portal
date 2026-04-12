import { validationResult } from 'express-validator';
import * as jobService from '../services/jobService.js';


export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, company, location, description, requirements, salaryRange, workType, industry } = req.body;
    const job = await jobService.createJob({
      title, company, location, description, requirements, salaryRange, workType, industry, postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getJobs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;

    const filter = {};
    if (req.query.q) {
      const escaped = req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { company: regex }, { description: regex }, { skills: regex }, { requirements: regex }];
    }
    if (req.query.location) {
      const escaped = req.query.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = new RegExp(escaped, 'i');
    }
    if (req.query.workType) filter.workType = req.query.workType;

    const result = await jobService.getJobs(filter, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyJobs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;

    const filter = {};
    if (req.query.q) {
      const escaped = req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { company: regex }, { description: regex }, { skills: regex }, { requirements: regex }];
    }
    if (req.query.status) filter.status = req.query.status;

    const result = await jobService.getMyJobs(req.user._id, filter, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const stats = await jobService.getJobStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedJob = await jobService.updateJob(req.params.id, req.user._id, req.body);
    res.json(updatedJob);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await jobService.deleteJob(req.params.id, req.user._id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getCompanyBySlug = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await jobService.getCompanyBySlug(req.params.companySlug);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getEmployerDashboard = async (req, res) => {
  try {
    const result = await jobService.getEmployerDashboard(req.user._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrending = async (_req, res) => {
  try {
    const result = await jobService.getTrending();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
