import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/Application.js';


export const createJob = async (req, res) => {
  const { title, company, location, description, requirements, salaryRange, workType, industry } = req.body;
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
      industry,
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
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    // Per-job applicant + pending counts
    const jobIds = jobs.map((j) => j._id);
    const appCounts = jobIds.length
      ? await Application.aggregate([
          { $match: { job: { $in: jobIds } } },
          {
            $group: {
              _id: '$job',
              total: { $sum: 1 },
              pending: {
                $sum: { $cond: [{ $eq: ['$applicationStatus', 'pending'] }, 1, 0] },
              },
            },
          },
        ])
      : [];

    const countMap = {};
    for (const item of appCounts) {
      countMap[item._id.toString()] = { total: item.total, pending: item.pending };
    }

    const jobsWithCounts = jobs.map((j) => ({
      ...j,
      applicationCount: countMap[j._id.toString()]?.total ?? 0,
      pendingCount: countMap[j._id.toString()]?.pending ?? 0,
    }));

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.json({
      data: jobsWithCounts,
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

    const [jobCounts, jobIds] = await Promise.all([
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

export const getCompanyBySlug = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { companySlug } = req.params;

    const normalizeToSlug = (value = '') =>
      value
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Build a case-insensitive regex from slug parts to filter at the DB level
    const parts = companySlug.split('-').filter(Boolean);
    const pattern = parts.map(p => p === 'and' ? '(?:and|&)' : p).join('[^a-z0-9]+');
    const candidateJobs = await Job.find({ company: new RegExp(pattern, 'i') });

    // Exact-match on the normalized slug to avoid false positives
    const matchingJobs = candidateJobs.filter(
      (job) => normalizeToSlug(job.company || '') === companySlug
    );

    if (matchingJobs.length === 0) {
      return res.status(404).json({
        message: 'Company not found',
      });
    }

    const firstJob = matchingJobs[0];

    const company = {
      name: firstJob.company,
      tagline: firstJob.companyTagline || 'Find your next opportunity with this company.',
      description:
        firstJob.companyDescription ||
        `${firstJob.company} is actively hiring. Browse open roles and learn more about the company.`,
      industry: firstJob.industry || 'Technology',
      headquarters: firstJob.headquarters || firstJob.location || 'Not listed',
      website: firstJob.companyWebsite || '',
      size: firstJob.companySize || 'Not listed',
      founded: firstJob.companyFounded || 'Not listed',
      whyJoin:
        firstJob.whyJoin ||
        `Explore opportunities at ${firstJob.company} and join a team working on meaningful projects.`,
    };

    return res.status(200).json({
      company,
      jobs: matchingJobs,
    });
  } catch (error) {
    console.error('Error fetching company by slug:', error);
    return res.status(500).json({
      message: 'Server error while fetching company profile',
    });
  }
};

export const getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.user._id;

    // All employer jobs sorted newest first
    const allJobs = await Job.find({ postedBy: employerId }).sort({ createdAt: -1 }).lean();
    const jobIds = allJobs.map((j) => j._id);

    const [appCountsPerJob, appStatusCounts, recentApplications] = await Promise.all([
      // Per-job: total applicants + pending count
      jobIds.length
        ? Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            {
              $group: {
                _id: '$job',
                total: { $sum: 1 },
                pending: {
                  $sum: { $cond: [{ $eq: ['$applicationStatus', 'pending'] }, 1, 0] },
                },
              },
            },
          ])
        : [],

      // Overall status breakdown
      jobIds.length
        ? Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
          ])
        : [],

      // 3 most recent applications with applicant name + job title
      jobIds.length
        ? Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('job', 'title')
            .lean()
        : [],
    ]);

    // Build per-job lookup map
    const countLookup = {};
    for (const item of appCountsPerJob) {
      countLookup[item._id.toString()] = { total: item.total, pending: item.pending };
    }

    // Merge counts into each job
    const jobsWithCounts = allJobs.map((job) => ({
      ...job,
      applicationCount: countLookup[job._id.toString()]?.total || 0,
      pendingCount: countLookup[job._id.toString()]?.pending || 0,
    }));

    // Build overall stats
    const statusLookup = {};
    for (const item of appStatusCounts) {
      statusLookup[item._id] = item.count;
    }
    const totalApplications = appCountsPerJob.reduce((sum, item) => sum + item.total, 0);

    return res.json({
      stats: {
        totalJobs: allJobs.length,
        activeJobs: allJobs.filter((j) => j.status === 'active').length,
        totalApplications,
        pendingApplications: statusLookup.pending || 0,
        shortlistedApplications: statusLookup.shortlisted || 0,
      },
      jobs: jobsWithCounts,
      recentApplications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
