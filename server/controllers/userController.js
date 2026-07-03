const User = require('../models/User');
const Flat = require('../models/Flat');
const asyncWrapper = require('../utils/asyncWrapper');

// Get Resident Directory
// GET /api/v1/users/directory
// Accessible by approved residents, tenants, admins, guards
const getDirectoryUsers = asyncWrapper(async (req, res) => {
  const { block, flatNumber, name } = req.query;

  // Filter query
  const query = {
    isApproved: true,
    role: { $in: ['resident', 'tenant', 'admin'] },
  };

  // If society is set on user, restrict directory to their society
  if (req.user.societyId) {
    query.societyId = req.user.societyId;
  }

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  // To filter by block or flat number, we need to populate Flat
  let flats = [];
  if (block || flatNumber) {
    const flatQuery = {};
    if (block) flatQuery.block = block;
    if (flatNumber) flatQuery.flatNumber = flatNumber;
    if (req.user.societyId) flatQuery.societyId = req.user.societyId;

    flats = await Flat.find(flatQuery).select('_id');
    const flatIds = flats.map((f) => f._id);
    query.flatId = { $in: flatIds };
  }

  const users = await User.find(query)
    .select('name email phone role flatId societyId familyMembers vehicles')
    .populate('flatId', 'flatNumber block')
    .populate('societyId', 'name');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Get All Users (Admin Control Panel)
// GET /api/v1/users
// Restricted to Admin and Super Admin
const getAllUsers = asyncWrapper(async (req, res) => {
  const { isApproved, role, name } = req.query;

  const query = {};

  if (req.user.role === 'admin' && req.user.societyId) {
    query.societyId = req.user.societyId;
  }

  if (isApproved !== undefined) {
    query.isApproved = isApproved === 'true';
  }

  if (role) {
    query.role = role;
  }

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  const users = await User.find(query)
    .populate('flatId', 'flatNumber block')
    .populate('societyId', 'name');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});
// Update User (Self update or Admin override)
// PUT /api/v1/users/:id
const updateUser = asyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const isSelf = req.user._id.toString() === userId;
  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

  if (!isSelf && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this profile.',
    });
  }

  let user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  const { name, phone, familyMembers, vehicles, role, flatId, societyId, isApproved } = req.body;

  // Build update object based on permissions
  const updateData = {};

  if (isSelf) {
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (familyMembers) updateData.familyMembers = familyMembers;
    if (vehicles) updateData.vehicles = vehicles;
  }

  if (isAdmin) {
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (familyMembers) updateData.familyMembers = familyMembers;
    if (vehicles) updateData.vehicles = vehicles;
    if (role) updateData.role = role;
    if (flatId !== undefined) updateData.flatId = flatId || null;
    if (societyId) updateData.societyId = societyId;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
  }

  // If flatId changed, update flat owner/tenant linking
  if (flatId !== undefined && isAdmin) {
    const oldFlatId = user.flatId;
    const newFlatId = flatId;

    // Unlink old flat if it exists
    if (oldFlatId) {
      const oldFlat = await Flat.findById(oldFlatId);
      if (oldFlat) {
        if (user.role === 'resident' && oldFlat.ownerId?.toString() === userId) {
          oldFlat.ownerId = null;
        } else if (user.role === 'tenant' && oldFlat.tenantId?.toString() === userId) {
          oldFlat.tenantId = null;
        }
        await oldFlat.save();
      }
    }

    // Link new flat
    if (newFlatId) {
      const newFlat = await Flat.findById(newFlatId);
      if (newFlat) {
        if (role === 'resident' || user.role === 'resident') {
          newFlat.ownerId = userId;
        } else if (role === 'tenant' || user.role === 'tenant') {
          newFlat.tenantId = userId;
        }
        await newFlat.save();
      }
    }
  }

  user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).populate('flatId', 'flatNumber block').populate('societyId', 'name');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
});

// Approve User Registration
// PUT /api/v1/users/:id/approve
// Restricted to Admin and Super Admin
const approveUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  user.isApproved = true;
  await user.save();

  // If user has a flatId, ensure that flat links to this user
  if (user.flatId) {
    const flat = await Flat.findById(user.flatId);
    if (flat) {
      if (user.role === 'resident') {
        flat.ownerId = user._id;
      } else if (user.role === 'tenant') {
        flat.tenantId = user._id;
      }
      await flat.save();
    }
  }

  res.status(200).json({
    success: true,
    message: `Account for ${user.name} approved successfully.`,
  });
});

// Delete User
// DELETE /api/v1/users/:id
// Restricted to Admin and Super Admin
const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  // Remove reference from Flat if linked
  if (user.flatId) {
    const flat = await Flat.findById(user.flatId);
    if (flat) {
      if (flat.ownerId?.toString() === user._id.toString()) flat.ownerId = null;
      if (flat.tenantId?.toString() === user._id.toString()) flat.tenantId = null;
      await flat.save();
    }
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully.',
  });
});

module.exports = {
  getDirectoryUsers,
  getAllUsers,
  updateUser,
  approveUser,
  deleteUser,
};