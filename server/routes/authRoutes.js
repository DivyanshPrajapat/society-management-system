const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation Result Middleware handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('role')
      .isIn(['super_admin', 'admin', 'resident', 'tenant', 'security_guard'])
      .withMessage('Invalid role specified'),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Refresh Token
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  validate,
  authController.refresh
);

// Logout
router.post('/logout', authController.logout);

// Forgot Password
router.post(
  '/forgot-password',
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  ],
  validate,
  authController.forgotPassword
);

// Reset Password
router.post(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
