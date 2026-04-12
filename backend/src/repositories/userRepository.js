import User from '../models/User.js';

export const findById = (id) => User.findById(id);

export const findByIdWithPassword = (id) => User.findById(id).select('+password');

export const findByEmail = (email) => User.findOne({ email });

export const findByEmailWithPassword = (email) => User.findOne({ email }).select('+password');

export const createUser = (data) => User.create(data);

export const updateById = (id, update, options = {}) =>
  User.findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options });

export const deleteById = (id) => User.findByIdAndDelete(id);

export const countDocuments = (filter = {}) => User.countDocuments(filter);

export const findWithPagination = (filter, { skip, limit, sort = { createdAt: -1 } }) =>
  User.find(filter).sort(sort).skip(skip).limit(limit);

export const countByRole = async () => {
  const result = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const map = {};
  for (const { _id, count } of result) map[_id] = count;
  return map;
};

export const countNewSince = (date) => User.countDocuments({ createdAt: { $gte: date } });

export const registrationsByDay = (since) =>
  User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
