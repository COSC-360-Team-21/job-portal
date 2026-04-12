import path from 'path';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { validationResult } from 'express-validator';
import * as applicationService from '../services/applicationService.js';

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
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const submitApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const application = await applicationService.submitApplication({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      jobId: req.body.jobId,
      additionalMessage: req.body.additionalMessage,
      applicantId: req.user._id,
      resumePath: req.files.resume[0].path,
      coverLetterPath: req.files.coverLetter?.[0]?.path,
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: application._id,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to submit application.' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const result = await applicationService.getMyApplications(req.user._id, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReceivedApplications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await applicationService.getReceivedApplications(req.user._id, req.query);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const stats = await applicationService.getApplicationStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const withdrawMyApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await applicationService.withdrawApplication(req.params.id, req.user._id);
    res.json({ message: 'Application withdrawn successfully.', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to withdraw application.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const applicationStatus = await applicationService.updateApplicationStatus(
      req.params.id, req.user._id, req.body.status
    );
    res.json({ message: 'Status updated.', applicationStatus });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};