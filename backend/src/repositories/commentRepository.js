import Comment from '../models/Comment.js';

export const create = (data) => Comment.create(data);

export const findById = (id) => Comment.findById(id);

export const findByIdPopulated = (id) =>
  Comment.findById(id).populate('author', 'name profileImage');

export const deleteById = (id) => Comment.findByIdAndDelete(id);

export const deleteMany = (filter) => Comment.deleteMany(filter);

export const countDocuments = (filter = {}) => Comment.countDocuments(filter);

export const findByJob = (jobId, { skip = 0, limit = 50 } = {}) =>
  Comment.find({ job: jobId, parentComment: null })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name profileImage');

export const findReplies = (parentId) =>
  Comment.find({ parentComment: parentId })
    .sort({ createdAt: 1 })
    .populate('author', 'name profileImage');

export const findByAuthor = (authorId, { skip = 0, limit = 20 } = {}) =>
  Comment.find({ author: authorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('job', 'title company');

export const hotDiscussions = (since, limitNum = 10) =>
  Comment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limitNum },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: '$job' },
    {
      $project: {
        _id: 0,
        jobId: '$_id',
        title: '$job.title',
        company: '$job.company',
        commentCount: '$count',
      },
    },
  ]);

export const commentsByDay = (since) =>
  Comment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
