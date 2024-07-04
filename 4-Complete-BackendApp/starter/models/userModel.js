const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  // password will not be stored in the database in plain
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Never show the password in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Only works on CREATE or SAVE!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // Never show the active status in any output
  },
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Handle the password encryption
userSchema.pre('save', async function (next) {
  // If the password is not modified, skip the encryption
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12); // Encrypt with cost of 12
  this.passwordConfirm = undefined; // Delete passwordConfirm
  next();
});

// Update the passwordChangedAt field
userSchema.pre('save', function (next) {
  // If the password is not modified or the document is new, skip the passwordChangedAt update
  if (!this.isModified('password') || this.isNew) return next();

  // Subtract 1 second to ensure the token is always created after the passwordChangedAt
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Hide the inactive users
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Check for password validation
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if the user changed the password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // False means NOT changed
  }
  return false;
};

// Create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Send user the token to reset the password

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
