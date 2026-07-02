const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Society address is required'],
      trim: true,
    },
    blocks: [
      {
        type: String,
        trim: true,
      },
    ],
    totalFlats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Society = mongoose.model('Society', societySchema);

module.exports = Society;
