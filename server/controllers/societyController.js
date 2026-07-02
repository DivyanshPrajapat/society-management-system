const Society = require('../models/Society');
const asyncWrapper = require('../utils/asyncWrapper');

// Create a Society
// POST /api/v1/societies
const createSociety = asyncWrapper(async (req, res) => {
  const { name, address, blocks, totalFlats } = req.body;

  const society = await Society.create({
    name,
    address,
    blocks: blocks || [],
    totalFlats: totalFlats || 0,
  });

  res.status(201).json({
    success: true,
    message: 'Society created successfully.',
    data: society,
  });
});

// Get All Societies
// GET /api/v1/societies
const getAllSocieties = asyncWrapper(async (req, res) => {
  const societies = await Society.find();
  
  res.status(200).json({
    success: true,
    count: societies.length,
    data: societies,
  });
});

// Get Single Society
// GET /api/v1/societies/:id
const getSocietyById = asyncWrapper(async (req, res) => {
  const society = await Society.findById(req.params.id);

  if (!society) {
    return res.status(404).json({
      success: false,
      message: 'Society not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: society,
  });
});

// Update Society
// PUT /api/v1/societies/:id
const updateSociety = asyncWrapper(async (req, res) => {
  let society = await Society.findById(req.params.id);

  if (!society) {
    return res.status(404).json({
      success: false,
      message: 'Society not found.',
    });
  }

  society = await Society.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Society updated successfully.',
    data: society,
  });
});

// Delete Society
// DELETE /api/v1/societies/:id
const deleteSociety = asyncWrapper(async (req, res) => {
  const society = await Society.findById(req.params.id);

  if (!society) {
    return res.status(404).json({
      success: false,
      message: 'Society not found.',
    });
  }

  await society.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Society deleted successfully.',
  });
});

module.exports = {
  createSociety,
  getAllSocieties,
  getSocietyById,
  updateSociety,
  deleteSociety,
};
