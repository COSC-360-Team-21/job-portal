import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    resumePath: {
      type: String,
    },
    coverLetterPath: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
