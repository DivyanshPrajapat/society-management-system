const express = require('express');
const { body } = require('express-validator');
const societyController = require('../controllers/societyController');
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

// Public route to list societies for register screen dropdown
router.get('/', societyController.getAllSocieties);

// Protected routes
router.get('/:id', protect, societyController.getSocietyById);

router.post(
  '/',
  protect,
  restrictTo('super_admin'),
  [
    body('name').trim().notEmpty().withMessage('Society name is required'),
    body('address').trim().notEmpty().withMessage('Society address is required'),
  ],
  validate,
  societyController.createSociety
);

router.put(
  '/:id',
  protect,
  restrictTo('super_admin', 'admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Society name cannot be empty'),
    body('address').optional().trim().notEmpty().withMessage('Society address cannot be empty'),
  ],
  validate,
  societyController.updateSociety
);

router.delete('/:id', protect, restrictTo('super_admin'), societyController.deleteSociety);

module.exports = router;
