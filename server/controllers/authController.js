const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Society = require('../models/Society');
const Flat = require('../models/Flat');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const asyncWrapper = require('../utils/asyncWrapper');

// Helper to create Nodemailer Transporter
const getMailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Register User
// POST /api/v1/auth/register
const register = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, role, flatId, societyId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is already registered. Please login.',
    });
  }

  // Determine approval status
  // Super admin is auto-approved to bootstrap the system.
  // Other roles require admin or super admin approval.
  const isApproved = role === 'super_admin';

  // If flatId is provided, check if flat exists
  if (flatId) {
    const flatExists = await Flat.findById(flatId);
    if (!flatExists) {
      return res.status(400).json({
        success: false,
        message: 'Flat not found.',
      });
    }
  }

  // If societyId is provided, check if society exists
  if (societyId) {
    const societyExists = await Society.findById(societyId);
    if (!societyExists) {
      return res.status(400).json({
        success: false,
        message: 'Society not found.',
      });
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    flatId: flatId || null,
    societyId: societyId || null,
    isApproved,
  });

  // Return user without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    flatId: user.flatId,
    societyId: user.societyId,
    isApproved: user.isApproved,
  };

  res.status(201).json({
    success: true,
    message: isApproved 
      ? 'Registration successful! You can now log in.' 
      : 'Registration successful! Your account is pending admin approval.',
    data: userResponse,
  });
});

// Login User
// POST /api/v1/auth/login
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Check for email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password.',
    });
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  // Check approval (if not super admin)
  if (!user.isApproved && user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_NOT_APPROVED',
      message: 'Your account is pending admin approval.',
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to user model
  user.refreshToken = refreshToken;
  await user.save();

  // Remove password from response
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      flatId: user.flatId,
      societyId: user.societyId,
    },
  });
});

// Refresh Access Token
// POST /api/v1/auth/refresh
const refresh = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_1234567890_very_long_and_secure_key');
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token. Please login again.',
    });
  }

  // Find user and check stored refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or token revoked. Please login again.',
    });
  }

  // Double check approval status
  if (!user.isApproved && user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_NOT_APPROVED',
      message: 'Your account is pending admin approval.',
    });
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});

// Logout (Revoke Refresh Token)
// POST /api/v1/auth/logout
const logout = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// Forgot Password
// POST /api/v1/auth/forgot-password
const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // For security reasons, don't reveal if email exists. Say email sent anyway.
    return res.status(200).json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set expiry
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `
    You are receiving this email because you (or someone else) have requested the reset of a password.
    Please click on the link below or copy and paste it into your browser to complete the process:
    
    ${resetUrl}
    
    Note: This link is valid for 30 minutes only. If you did not request this, please ignore this email.
  `;

  try {
    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM || 'noreply@society.com'}`,
      to: user.email,
      subject: 'Apartment/Society Management System - Password Reset Request',
      text: message,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    
    // Clear token fields on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // In development mode, output the token in the response or console so the developer can use it
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
      return res.status(200).json({
        success: true,
        message: 'SMTP is not configured. Development mode: Reset token logged in console.',
        devResetToken: resetToken,
        devResetUrl: resetUrl,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent. Please try again later.',
    });
  }
});

// Reset Password
// POST /api/v1/auth/reset-password/:token
const resetPassword = asyncWrapper(async (req, res) => {
  const resetToken = req.params.token;

  // Hash token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset token.',
    });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshToken = undefined; // Invalidate current session on password change
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.',
  });
});

const jwt = require('jsonwebtoken'); // Need jwt in scope for the verification in refresh route

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
