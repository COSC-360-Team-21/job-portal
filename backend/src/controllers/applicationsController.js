import path from 'path';
import { mkdirSync } from 'fs';
import multer from 'multer';
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
  try {
    const { name, email, phone, jobId, additionalMessage } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !jobId?.trim()) {
      return res.status(400).json({ message: 'Name, email, phone, and job ID are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const phoneRegex = /^\+?[\d\s\-().]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ message: 'Please provide a valid phone number.' });
    }

    if (!req.files?.resume?.[0]) {
      return res.status(400).json({ message: 'Resume is required.' });
    }

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
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location workType status')
      .sort({ createdAt: -1 });

    res.json({ data: applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only view applications for your own jobs.' });
    }

    const applications = await Application.find({ job: req.params.id }).sort({ createdAt: -1 });
    res.json({ data: applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
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
