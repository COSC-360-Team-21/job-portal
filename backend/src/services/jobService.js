import * as jobRepo from '../repositories/jobRepository.js';
import * as appRepo from '../repositories/applicationRepository.js';

export const createJob = (data) => jobRepo.create(data);

export const getJobs = async (filter, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [data, totalItems] = await Promise.all([
    jobRepo.findWithPagination(filter, { skip, limit, populate: { path: 'postedBy', select: 'name email' } }),
    jobRepo.countDocuments(filter),
  ]);
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    data,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const getJobById = (id) => jobRepo.findByIdPopulated(id);

export const getMyJobs = async (userId, filter, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const fullFilter = { postedBy: userId, ...filter };

  const [jobs, totalItems] = await Promise.all([
    jobRepo.findWithPagination(fullFilter, { skip, limit, lean: true }),
    jobRepo.countDocuments(fullFilter),
  ]);

  const jobIds = jobs.map((j) => j._id);
  const appCounts = jobIds.length ? await appRepo.aggregateByJob(jobIds) : [];

  const countMap = {};
  for (const item of appCounts) countMap[item._id.toString()] = { total: item.total, pending: item.pending };

  const jobsWithCounts = jobs.map((j) => ({
    ...j,
    applicationCount: countMap[j._id.toString()]?.total ?? 0,
    pendingCount: countMap[j._id.toString()]?.pending ?? 0,
  }));

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    data: jobsWithCounts,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const getJobStats = async (userId) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [jobCounts, jobIds] = await Promise.all([
    import('../models/Job.js').then((m) =>
      m.default.aggregate([
        { $match: { postedBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
    ),
    jobRepo.findByPostedBy(userId, '_id'),
  ]);

  const ids = jobIds.map((j) => j._id);

  const [totalApplications, weekApplications] = await Promise.all([
    ids.length ? appRepo.countDocuments({ job: { $in: ids } }) : 0,
    ids.length ? appRepo.countDocuments({ job: { $in: ids }, createdAt: { $gte: oneWeekAgo } }) : 0,
  ]);

  const stats = { totalJobs: 0, activeJobs: 0, closedJobs: 0, totalApplications, newApplicationsThisWeek: weekApplications };
  for (const { _id, count } of jobCounts) {
    stats.totalJobs += count;
    if (_id === 'active') stats.activeJobs = count;
    if (_id === 'closed') stats.closedJobs = count;
  }
  return stats;
};

export const updateJob = async (jobId, userId, body) => {
  const job = await jobRepo.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });
  if (job.postedBy.toString() !== userId.toString()) {
    throw Object.assign(new Error('Forbidden: you can only update your own jobs'), { status: 403 });
  }

  const updatableFields = ['title', 'company', 'location', 'description', 'requirements', 'salaryRange', 'workType'];
  updatableFields.forEach((field) => {
    if (body[field] !== undefined) job[field] = body[field];
  });

  return job.save();
};

export const deleteJob = async (jobId, userId) => {
  const job = await jobRepo.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });
  if (job.postedBy.toString() !== userId.toString()) {
    throw Object.assign(new Error('Forbidden: you can only delete your own jobs'), { status: 403 });
  }
  await job.deleteOne();
};

export const getCompanyBySlug = async (companySlug) => {
  const normalizeToSlug = (value = '') =>
    value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const parts = companySlug.split('-').filter(Boolean);
  const pattern = parts.map((p) => (p === 'and' ? '(?:and|&)' : p)).join('[^a-z0-9]+');
  const candidateJobs = await jobRepo.findByCompanyRegex(pattern);
  const matchingJobs = candidateJobs.filter((job) => normalizeToSlug(job.company || '') === companySlug);

  if (matchingJobs.length === 0) throw Object.assign(new Error('Company not found'), { status: 404 });

  const firstJob = matchingJobs[0];
  const company = {
    name: firstJob.company,
    tagline: firstJob.companyTagline || 'Find your next opportunity with this company.',
    description: firstJob.companyDescription || `${firstJob.company} is actively hiring. Browse open roles and learn more about the company.`,
    industry: firstJob.industry || 'Technology',
    headquarters: firstJob.headquarters || firstJob.location || 'Not listed',
    website: firstJob.companyWebsite || '',
    size: firstJob.companySize || 'Not listed',
    founded: firstJob.companyFounded || 'Not listed',
    whyJoin: firstJob.whyJoin || `Explore opportunities at ${firstJob.company} and join a team working on meaningful projects.`,
  };

  return { company, jobs: matchingJobs };
};

export const getEmployerDashboard = async (userId) => {
  const Job = (await import('../models/Job.js')).default;
  const allJobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 }).lean();
  const jobIds = allJobs.map((j) => j._id);

  const [appCountsPerJob, appStatusCounts, recentApplications] = await Promise.all([
    jobIds.length ? appRepo.aggregateByJob(jobIds) : [],
    jobIds.length ? appRepo.aggregateByStatus({ job: { $in: jobIds } }) : [],
    jobIds.length
      ? (await import('../models/Application.js')).default
          .find({ job: { $in: jobIds } })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate('job', 'title')
          .lean()
      : [],
  ]);

  const countLookup = {};
  for (const item of appCountsPerJob) countLookup[item._id.toString()] = { total: item.total, pending: item.pending };

  const jobsWithCounts = allJobs.map((job) => ({
    ...job,
    applicationCount: countLookup[job._id.toString()]?.total || 0,
    pendingCount: countLookup[job._id.toString()]?.pending || 0,
  }));

  const statusLookup = {};
  for (const item of appStatusCounts) statusLookup[item._id] = item.count;
  const totalApplications = appCountsPerJob.reduce((sum, item) => sum + item.total, 0);

  return {
    stats: {
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter((j) => j.status === 'active').length,
      totalApplications,
      pendingApplications: statusLookup.pending || 0,
      shortlistedApplications: statusLookup.shortlisted || 0,
    },
    jobs: jobsWithCounts,
    recentApplications,
  };
};

export const getTrending = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [hotJobs, topCompanies] = await Promise.all([
    import('../models/Application.js').then((m) =>
      m.default.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        {
          $project: {
            _id: 0,
            jobId: '$_id',
            title: '$job.title',
            company: '$job.company',
            location: '$job.location',
            applicationCount: 1,
          },
        },
      ])
    ),
    jobRepo.topCompanies(5),
  ]);

  return { hotJobs, topCompanies };
};
