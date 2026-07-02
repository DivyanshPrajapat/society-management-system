const Flat = require('../models/Flat');
const asyncWrapper = require('../utils/asyncWrapper');

// Create a Flat
// POST /api/v1/flats
const createFlat = asyncWrapper(async (req, res) => {
  const { flatNumber, block, ownerId, tenantId, sqft, societyId } = req.body;

  const flat = await Flat.create({
    flatNumber,
    block,
    ownerId: ownerId || null,
    tenantId: tenantId || null,
    sqft,
    societyId,
  });

  res.status(201).json({
    success: true,
    message: 'Flat created successfully.',
    data: flat,
  });
});

// Get All Flats (Filtered)
// GET /api/v1/flats
const getAllFlats = asyncWrapper(async (req, res) => {
  const { societyId, block, isOccupied } = req.query;

  const query = {};
  if (societyId) query.societyId = societyId;
  if (block) query.block = block;
  
  if (isOccupied === 'true') {
    query.$or = [{ ownerId: { $ne: null } }, { tenantId: { $ne: null } }];
  } else if (isOccupied === 'false') {
    query.ownerId = null;
    query.tenantId = null;
  }

  const flats = await Flat.find(query)
    .populate('ownerId', 'name email phone')
    .populate('tenantId', 'name email phone')
    .populate('societyId', 'name');

  res.status(200).json({
    success: true,
    count: flats.length,
    data: flats,
  });
});

// Get Single Flat
// GET /api/v1/flats/:id
const getFlatById = asyncWrapper(async (req, res) => {
  const flat = await Flat.findById(req.params.id)
    .populate('ownerId', 'name email phone familyMembers vehicles')
    .populate('tenantId', 'name email phone familyMembers vehicles')
    .populate('societyId', 'name address');

  if (!flat) {
    return res.status(404).json({
      success: false,
      message: 'Flat not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: flat,
  });
});

// Update Flat
// PUT /api/v1/flats/:id
const updateFlat = asyncWrapper(async (req, res) => {
  let flat = await Flat.findById(req.params.id);

  if (!flat) {
    return res.status(404).json({
      success: false,
      message: 'Flat not found.',
    });
  }

  flat = await Flat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Flat updated successfully.',
    data: flat,
  });
});

// Delete Flat
// DELETE /api/v1/flats/:id
const deleteFlat = asyncWrapper(async (req, res) => {
  const flat = await Flat.findById(req.params.id);

  if (!flat) {
    return res.status(404).json({
      success: false,
      message: 'Flat not found.',
    });
  }

  await flat.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Flat deleted successfully.',
  });
});

module.exports = {
  createFlat,
  getAllFlats,
  getFlatById,
  updateFlat,
  deleteFlat,
};
