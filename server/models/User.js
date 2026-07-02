const mongoose = require('bcrypt'); // Wait, require mongoose, not bcrypt for mongoose schema! Let's be careful.
const mongooseDb = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongooseDb.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['super_admin', 'admin', 'resident', 'tenant', 'security_guard'],
        message: 'Role must be either super_admin, admin, resident, tenant, or security_guard',
      },
      required: [true, 'Please specify a role'],
    },
    flatId: {
      type: mongooseDb.Schema.Types.ObjectId,
      ref: 'Flat',
      default: null,
    },
    societyId: {
      type: mongooseDb.Schema.Types.ObjectId,
      ref: 'Society',
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    familyMembers: [
      {
        name: { type: String, trim: true },
        relation: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    ],
    vehicles: [
      {
        vehicleType: { type: String, enum: ['2-wheeler', '4-wheeler'] },
        vehicleNumber: { type: String, trim: true },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongooseDb.model('User', userSchema);

module.exports = User;
