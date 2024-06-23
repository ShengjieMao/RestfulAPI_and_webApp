const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // user and tour should be the parents of the review when referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Preventing duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populating might be time-consuming if there are many reviews
reviewSchema.pre(/^find/, function (next) {
  // Deprecated - populating ids is inefficient
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this points to the model
  // Aggregation pipeline
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      // Grouping by tour
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, // Number of ratings = ++1 for each rating
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0,
    ratingsAverage: stats.length > 0 ? stats[0].avgRating : 4.5,
  });
};

reviewSchema.post('save', function () {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this points to the query
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() --> does NOT work here because the query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
