const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Filter out unwanted fields names that are not allowed to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // if (!allowedFields.includes(el)) delete obj[el];
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Middleware to get the current user's data
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res) => {
  // 1. Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
    );
  }

  // 2. Filtered out not allowed update-fields
  const filteredBody = filterObj(req.body, 'name', 'email'); // For database security

  // 3. Update user document
  // Can use findByIdAndUpdate b/c the update is not sensitive data - no password includes
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // user.name = 'New Name';
  // await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined. Please use /signup instead.',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update password with this update function
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
