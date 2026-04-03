import path from 'path';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

// Ensure uploads directory exists
const uploadDir = 'uploads';
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const submitApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, phone, jobId, additionalMessage } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications.' });
    }

    const application = await Application.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      additionalMessage: additionalMessage?.trim() ?? '',
      job: jobId,
      applicant: req.user._id,
      resumePath: req.files.resume[0].path,
      coverLetterPath: req.files.coverLetter?.[0]?.path ?? null,
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: application._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to submit application.' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { applicant: req.user._id };

    const [applications, totalItems] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title company location workType status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.json({
      data: applications,
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


export const getReceivedApplications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const employerJobs = await Job.find({ postedBy: req.user._id }, '_id').lean();
    const jobIds = employerJobs.map((j) => j._id);

    if (jobIds.length === 0) {
      return res.json({
        data: [],
        pagination: { page, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      });
    }

    const filter = { job: { $in: jobIds } };

    if (req.query.applicationStatus) filter.applicationStatus = req.query.applicationStatus;

    if (req.query.jobId) {
      const isOwned = jobIds.some((id) => id.toString() === req.query.jobId);
      if (!isOwned) return res.status(403).json({ message: 'Forbidden: that job does not belong to you.' });
      filter.job = req.query.jobId;
    }

    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [applications, totalItems] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('job', 'title company')
        .populate('applicant', 'name email'),
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.json({
      data: applications,
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

export const updateApplicationStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}.` });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only update applications for your own jobs.' });
    }

    application.applicationStatus = status;
    await application.save();

    res.json({ message: 'Status updated.', applicationStatus: application.applicationStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
