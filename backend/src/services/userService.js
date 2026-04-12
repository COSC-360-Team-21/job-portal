import * as userRepo from '../repositories/userRepository.js';
import * as jobRepo from '../repositories/jobRepository.js';
import * as appRepo from '../repositories/applicationRepository.js';

export const registerUser = async ({ name, email, password, role, profileImage }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 400 });

  return userRepo.createUser({ name, email, password, role, profileImage });
};

export const loginUser = async (email, password) => {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user || !(await user.matchPassword(password))) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }
  if (user.isActive === false) {
    throw Object.assign(new Error('Your account has been disabled. Contact an administrator.'), { status: 403 });
  }
  return user;
};

export const getProfile = (userId) => userRepo.findById(userId);

export const updateProfile = async (userId, role, body) => {
  const JOBSEEKER_ALLOWED = [
    'name', 'profile.phone', 'profile.location', 'profile.bio',
    'profile.headline', 'profile.skills', 'profile.preferredIndustries',
  ];

  const EMPLOYER_ALLOWED = [
    'name', 'profile.phone', 'profile.contactEmail', 'profile.companyName',
    'profile.companyDescription', 'profile.industry', 'profile.companySize',
    'profile.websiteUrl', 'profile.companyLocation', 'profile.companyLogoUrl',
  ];

  const allowed = role === 'employer' ? EMPLOYER_ALLOWED : JOBSEEKER_ALLOWED;
  const update = {};

  for (const key of allowed) {
    const [top, sub] = key.split('.');
    if (sub) {
      if (body[top] !== undefined && body[top][sub] !== undefined) update[key] = body[top][sub];
    } else if (body[top] !== undefined) {
      update[top] = body[top];
    }
  }

  if (Object.keys(update).length === 0) {
    throw Object.assign(new Error('No valid fields provided'), { status: 400 });
  }

  return userRepo.updateById(userId, { $set: update });
};

export const updateProfileImage = async (userId, imagePath) => {
  return userRepo.updateById(userId, { $set: { profileImage: imagePath } });
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!(await user.matchPassword(currentPassword))) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
  }
  user.password = newPassword;
  await user.save();
};

export const changeEmail = async (userId, newEmail, password) => {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!(await user.matchPassword(password))) {
    throw Object.assign(new Error('Incorrect password'), { status: 401 });
  }
  const existing = await userRepo.findByEmail(newEmail);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 400 });

  user.email = newEmail;
  await user.save();
};

export const deleteAccount = async (userId, password) => {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!(await user.matchPassword(password))) {
    throw Object.assign(new Error('Incorrect password'), { status: 401 });
  }

  if (user.role === 'employer') {
    const jobs = await jobRepo.findByPostedBy(user._id, '_id');
    const jobIds = jobs.map((j) => j._id);
    if (jobIds.length > 0) await appRepo.deleteMany({ job: { $in: jobIds } });
    await jobRepo.deleteMany({ postedBy: user._id });
  } else {
    await appRepo.deleteMany({ applicant: user._id });
  }

  await userRepo.deleteById(user._id);
};
