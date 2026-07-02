const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Block identifier is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sqft: {
      type: Number,
      required: [true, 'Flat size in sqft is required'],
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Flat must belong to a society'],
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique flat number per block in a society
flatSchema.index({ flatNumber: 1, block: 1, societyId: 1 }, { unique: true });

const Flat = mongoose.model('Flat', flatSchema);

module.exports = Flat;
