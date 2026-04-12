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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    additionalMessage: {
      type: String,
      trim: true,
      default: '',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
    },
    applicationStatus: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
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

applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicationStatus: 1 });

export default mongoose.model('Application', applicationSchema);
