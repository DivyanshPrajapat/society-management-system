const express = require('express');
const { body, query } = require('express-validator');
const flatController = require('../controllers/flatController');
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

router.use(protect); // All flat routes require authentication

router.get('/', flatController.getAllFlats);
router.get('/:id', flatController.getFlatById);

router.post(
  '/',
  restrictTo('super_admin', 'admin'),
  [
    body('flatNumber').trim().notEmpty().withMessage('Flat number is required'),
    body('block').trim().notEmpty().withMessage('Block identifier is required'),
    body('sqft').isNumeric().withMessage('Square footage must be a number'),
    body('societyId').isMongoId().withMessage('Valid Society ID is required'),
    body('ownerId').optional({ nullable: true }).isMongoId().withMessage('Valid Owner ID is required'),
    body('tenantId').optional({ nullable: true }).isMongoId().withMessage('Valid Tenant ID is required'),
  ],
  validate,
  flatController.createFlat
);

router.put(
  '/:id',
  restrictTo('super_admin', 'admin'),
  [
    body('flatNumber').optional().trim().notEmpty().withMessage('Flat number cannot be empty'),
    body('block').optional().trim().notEmpty().withMessage('Block identifier cannot be empty'),
    body('sqft').optional().isNumeric().withMessage('Square footage must be a number'),
    body('societyId').optional().isMongoId().withMessage('Valid Society ID is required'),
  ],
  validate,
  flatController.updateFlat
);

router.delete('/:id', restrictTo('super_admin', 'admin'), flatController.deleteFlat);

module.exports = router;
