import { validationResult } from 'express-validator';
import Job from '../models/Job.js';

export const createJob = async (req, res) => {
  const { title, company, location, description, requirements, salaryRange, workType } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      salaryRange,
      workType,
      postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own jobs' });
    }

    const updatableFields = [
      'title',
      'company',
      'location',
      'description',
      'requirements',
      'salaryRange',
      'workType',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only delete your own jobs' });
    }
    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
