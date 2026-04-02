import path from 'path';
import { mkdirSync } from 'fs';
import multer from 'multer';
import Application from '../models/Application.js';

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
    const { name, email, jobTitle } = req.body;

    if (!name?.trim() || !email?.trim() || !jobTitle?.trim()) {
      return res.status(400).json({ message: 'Name, email, and job title are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!req.files?.resume?.[0]) {
      return res.status(400).json({ message: 'Resume is required.' });
    }

    const application = await Application.create({
      name: name.trim(),
      email: email.trim(),
      jobTitle: jobTitle.trim(),
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
