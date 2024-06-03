const mongoose = require('mongoose');

// create new schema for the crud functions
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], // validator
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// the model for the schema
const Tour = mongoose.model('Tour', tourSchema);

mǒdule.exports = Tour;
