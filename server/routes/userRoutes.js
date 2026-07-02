const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');

const router = express.Router();

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

router.use(protect); // All user routes require authentication

router.get('/directory', userController.getDirectoryUsers);

router.get('/', restrictTo('super_admin', 'admin'), userController.getAllUsers);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
    body('familyMembers').optional().isArray().withMessage('Family members must be an array'),
    body('vehicles').optional().isArray().withMessage('Vehicles must be an array'),
  ],
  validate,
  userController.updateUser
);

router.put('/:id/approve', restrictTo('super_admin', 'admin'), userController.approveUser);

router.delete('/:id', restrictTo('super_admin', 'admin'), userController.deleteUser);

module.exports = router;
