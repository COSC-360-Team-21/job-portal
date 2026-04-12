import Application from '../models/Application.js';

export const create = (data) => Application.create(data);

export const findById = (id) => Application.findById(id);

export const findByIdPopulated = (id) => Application.findById(id).populate('job');

export const countDocuments = (filter = {}) => Application.countDocuments(filter);

export const deleteMany = (filter) => Application.deleteMany(filter);

export const findWithPagination = (filter, { skip, limit, sort = { createdAt: -1 }, populate } = {}) => {
  let q = Application.find(filter).sort(sort).skip(skip).limit(limit);
  if (Array.isArray(populate)) {
    for (const p of populate) q = q.populate(p.path, p.select);
  } else if (populate) {
    q = q.populate(populate.path, populate.select);
  }
  return q;
};

export const findOne = (filter) => Application.findOne(filter);

export const aggregateByStatus = (matchFilter) =>
  Application.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
  ]);

export const aggregateByJob = (jobIds) =>
  Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: '$job',
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$applicationStatus', 'pending'] }, 1, 0] } },
      },
    },
  ]);

export const applicationsByDay = (since) =>
  Application.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

export const statusBreakdown = () =>
  Application.aggregate([{ $group: { _id: '$applicationStatus', count: { $sum: 1 } } }]);
