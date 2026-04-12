import * as appRepo from '../repositories/applicationRepository.js';
import * as jobRepo from '../repositories/jobRepository.js';

export const submitApplication = async (data) => {
  const job = await jobRepo.findById(data.jobId);
  if (!job) throw Object.assign(new Error('Job not found.'), { status: 404 });
  if (job.status !== 'active') {
    throw Object.assign(new Error('This job is no longer accepting applications.'), { status: 400 });
  }

  return appRepo.create({
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    additionalMessage: data.additionalMessage?.trim() ?? '',
    job: data.jobId,
    applicant: data.applicantId,
    resumePath: data.resumePath,
    coverLetterPath: data.coverLetterPath ?? null,
  });
};

export const getMyApplications = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = { applicant: userId };

  const [data, totalItems] = await Promise.all([
    appRepo.findWithPagination(filter, {
      skip,
      limit,
      populate: { path: 'job', select: 'title company location workType status salaryRange' },
    }),
    appRepo.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    data,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const getReceivedApplications = async (userId, query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const employerJobs = await jobRepo.findByPostedBy(userId, '_id');
  const jobIds = employerJobs.map((j) => j._id);

  if (jobIds.length === 0) {
    return { data: [], pagination: { page, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
  }

  const filter = { job: { $in: jobIds } };
  if (query.applicationStatus) filter.applicationStatus = query.applicationStatus;

  if (query.jobId) {
    const isOwned = jobIds.some((id) => id.toString() === query.jobId);
    if (!isOwned) throw Object.assign(new Error('Forbidden: that job does not belong to you.'), { status: 403 });
    filter.job = query.jobId;
  }

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

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
  return {
    data,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const getApplicationStats = async (userId) => {
  const counts = await appRepo.aggregateByStatus({ applicant: userId });
  const stats = { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 };
  for (const { _id, count } of counts) {
    if (_id in stats) stats[_id] = count;
    stats.total += count;
  }
  return stats;
};

export const withdrawApplication = async (appId, userId) => {
  const application = await appRepo.findOne({ _id: appId, applicant: userId });
  if (!application) throw Object.assign(new Error('Application not found.'), { status: 404 });

  const removedStatus = application.applicationStatus;
  await application.deleteOne();
  return { removedStatus, applicationId: appId };
};

export const updateApplicationStatus = async (appId, userId, status) => {
  const allowed = ['pending', 'reviewed', 'shortlisted', 'rejected'];
  if (!allowed.includes(status)) {
    throw Object.assign(new Error(`Status must be one of: ${allowed.join(', ')}.`), { status: 400 });
  }

  const application = await appRepo.findByIdPopulated(appId);
  if (!application) throw Object.assign(new Error('Application not found.'), { status: 404 });

  if (application.job.postedBy.toString() !== userId.toString()) {
    throw Object.assign(new Error('Forbidden: you can only update applications for your own jobs.'), { status: 403 });
  }

  application.applicationStatus = status;
  await application.save();
  return application.applicationStatus;
};
