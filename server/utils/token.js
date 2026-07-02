const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      societyId: user.societyId,
    },
    process.env.JWT_ACCESS_SECRET || 'dev_access_secret_1234567890_very_long_and_secure_key',
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_1234567890_very_long_and_secure_key',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
