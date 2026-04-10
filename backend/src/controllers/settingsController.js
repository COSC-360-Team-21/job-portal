import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const updateEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { newEmail, password } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { password } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (user.role === 'employer') {
      const jobs = await Job.find({ postedBy: user._id }).select('_id');
      const jobIds = jobs.map((j) => j._id);
      if (jobIds.length > 0) {
        await Application.deleteMany({ job: { $in: jobIds } });
      }
      await Job.deleteMany({ postedBy: user._id });
    } else {
      await Application.deleteMany({ applicant: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
