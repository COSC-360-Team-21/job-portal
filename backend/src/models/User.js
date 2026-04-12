import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      phone: { type: String, trim: true },
      location: { type: String, trim: true },
      bio: { type: String, maxlength: 500 },
      headline: { type: String, trim: true, maxlength: 120 },
      skills: [{ type: String, trim: true }],
      preferredIndustries: [{ type: String, trim: true }],
      contactEmail: { type: String, lowercase: true, trim: true },
      companyName: { type: String, trim: true },
      companyDescription: { type: String },
      industry: { type: String, trim: true },
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'],
      },
      websiteUrl: { type: String, trim: true },
      companyLocation: { type: String, trim: true },
      companyLogoUrl: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);