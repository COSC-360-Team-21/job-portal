import Job from '../models/Job.js';

export const create = (data) => Job.create(data);

export const findById = (id) => Job.findById(id);

export const findByIdPopulated = (id) => Job.findById(id).populate('postedBy', 'name email');

export const deleteById = (id) => Job.findByIdAndDelete(id);

export const deleteMany = (filter) => Job.deleteMany(filter);

export const countDocuments = (filter = {}) => Job.countDocuments(filter);

export const findWithPagination = (filter, { skip, limit, sort = { createdAt: -1 }, populate, lean } = {}) => {
  let q = Job.find(filter).sort(sort).skip(skip).limit(limit);
  if (populate) q = q.populate(populate.path, populate.select);
  if (lean) q = q.lean();
  return q;
};

export const findByPostedBy = (userId, select) => Job.find({ postedBy: userId }, select).lean();

export const findByFilter = (filter) => Job.find(filter);

export const findByCompanyRegex = (pattern) => Job.find({ company: new RegExp(pattern, 'i') });

export const countByStatus = async () => {
  const result = await Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const map = {};
  for (const { _id, count } of result) map[_id] = count;
  return map;
};

export const jobsByDay = (since) =>
  Job.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

export const topCompanies = (limitNum = 10) =>
  Job.aggregate([
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limitNum },
  ]);
