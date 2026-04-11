import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.q) {
      const escaped = req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex },
        { requirements: regex },
      ];
    }

    if (req.query.location) {
      const escaped = req.query.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = new RegExp(escaped, 'i');
    }

    if (req.query.workType) {
      filter.workType = req.query.workType;
    }

    const [jobs, totalItems] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('postedBy', 'name email'),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.json({
      data: jobs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyJobs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { postedBy: req.user._id };

    if (req.query.q) {
      const escaped = req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex },
        { requirements: regex },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [jobs, totalItems] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.json({
      data: jobs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [jobCounts, jobIds, newApplicationsThisWeek] = await Promise.all([
      Job.aggregate([
        { $match: { postedBy: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Job.find({ postedBy: req.user._id }, '_id').lean(),
      null,
    ]);

    const ids = jobIds.map((j) => j._id);

    const [totalApplications, weekApplications] = await Promise.all([
      ids.length ? Application.countDocuments({ job: { $in: ids } }) : 0,
      ids.length ? Application.countDocuments({ job: { $in: ids }, createdAt: { $gte: oneWeekAgo } }) : 0,
    ]);

    const stats = { totalJobs: 0, activeJobs: 0, closedJobs: 0, totalApplications, newApplicationsThisWeek: weekApplications };
    for (const { _id, count } of jobCounts) {
      stats.totalJobs += count;
      if (_id === 'active') stats.activeJobs = count;
      if (_id === 'closed') stats.closedJobs = count;
    }

    res.json(stats);
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
