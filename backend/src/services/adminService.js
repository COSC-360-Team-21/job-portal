import * as userRepo from '../repositories/userRepository.js';
import * as jobRepo from '../repositories/jobRepository.js';
import * as appRepo from '../repositories/applicationRepository.js';
import * as commentRepo from '../repositories/commentRepository.js';

export const getStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers, jobseekerCount, employerCount, adminCount,
    totalJobs, activeJobs, closedJobs,
    totalApplications, pendingApplications, reviewedApplications,
    shortlistedApplications, rejectedApplications,
    newUsersLast30Days, totalComments,
  ] = await Promise.all([
    userRepo.countDocuments(),
    userRepo.countDocuments({ role: 'jobseeker' }),
    userRepo.countDocuments({ role: 'employer' }),
    userRepo.countDocuments({ role: 'admin' }),
    jobRepo.countDocuments(),
    jobRepo.countDocuments({ status: 'active' }),
    jobRepo.countDocuments({ status: 'closed' }),
    appRepo.countDocuments(),
    appRepo.countDocuments({ applicationStatus: 'pending' }),
    appRepo.countDocuments({ applicationStatus: 'reviewed' }),
    appRepo.countDocuments({ applicationStatus: 'shortlisted' }),
    appRepo.countDocuments({ applicationStatus: 'rejected' }),
    userRepo.countNewSince(thirtyDaysAgo),
    commentRepo.countDocuments(),
  ]);

  return {
    users: { total: totalUsers, byRole: { jobseeker: jobseekerCount, employer: employerCount, admin: adminCount }, newLast30Days: newUsersLast30Days },
    jobs: { total: totalJobs, byStatus: { active: activeJobs, closed: closedJobs } },
    applications: { total: totalApplications, byStatus: { pending: pendingApplications, reviewed: reviewedApplications, shortlisted: shortlistedApplications, rejected: rejectedApplications } },
    comments: { total: totalComments },
  };
};

export const getActivityByDate = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [registrations, jobs, applications, comments] = await Promise.all([
    userRepo.registrationsByDay(since),
    jobRepo.jobsByDay(since),
    appRepo.applicationsByDay(since),
    commentRepo.commentsByDay(since),
  ]);

  return { registrations, jobs, applications, comments };
};

export const getUsers = async (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.q) {
    const escaped = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [data, totalItems] = await Promise.all([
    userRepo.findWithPagination(filter, { skip, limit }),
    userRepo.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return { data, pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } };
};

export const getUserById = (id) => userRepo.findById(id);

export const toggleUserActive = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

export const deleteUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  if (user.role === 'employer') {
    const jobs = await jobRepo.findByPostedBy(user._id, '_id');
    const jobIds = jobs.map((j) => j._id);
    if (jobIds.length > 0) {
      await appRepo.deleteMany({ job: { $in: jobIds } });
    }
    await jobRepo.deleteMany({ postedBy: user._id });
  } else if (user.role === 'jobseeker') {
    await appRepo.deleteMany({ applicant: user._id });
  }

  // Delete user's comments
  await commentRepo.deleteMany({ author: user._id });
  await user.deleteOne();
};

export const getAdminJobs = async (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.workType) filter.workType = query.workType;
  if (query.q) {
    const escaped = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ title: regex }, { company: regex }];
  }

  const [data, totalItems] = await Promise.all([
    jobRepo.findWithPagination(filter, { skip, limit, populate: { path: 'postedBy', select: 'name email' } }),
    jobRepo.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return { data, pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } };
};

export const deleteAdminJob = async (jobId) => {
  const job = await jobRepo.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  await appRepo.deleteMany({ job: job._id });
  await job.deleteOne();
};

export const setJobStatus = async (jobId, status) => {
  const job = await jobRepo.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  job.status = status;
  return job.save();
};

export const getAdminApplications = async (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status) filter.applicationStatus = query.status;

  const [data, totalItems] = await Promise.all([
    appRepo.findWithPagination(filter, {
      skip,
      limit,
      populate: [
        { path: 'job', select: 'title company' },
        { path: 'applicant', select: 'name email' },
      ],
    }),
    appRepo.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return { data, pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } };
};
