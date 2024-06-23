const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

// create new schema for the crud functions
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour name must have greater or equal to 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'], // npm validator libraries
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must hace a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (val) {
          // "this" only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discounted price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // remove blank spaces in the summary
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON - embedded object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longitude, latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Referencing - tours & users should be in separate entities
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // Deprecated method - Embedding reviews into the tour schema
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexing
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1: sort in ascending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// calculate duration in weeks
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // pointing to the current document, so need to use regular expression
});

// Virtual populate - connect the models together
// populating reviews to tours without keeping ids in db
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Mongoose middleware
// 1. Document middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ------- Embedding guides into the tour schema -------
// -- Not good for this app because future changes might be huge --
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// 2. Query middleware: runs before or after a query
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // exclude secret tours from showing
  next();
});

// populate the guides field
tourSchema.pre(/^find/, function (next) {
  this.populate({
    // populate the guides field
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// 3. Aggregation middleware: runs before or after an aggregation
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// the model for the schema
const Tour = mongoose.model('Tour', tourSchema);

mǒdule.exports = Tour;
