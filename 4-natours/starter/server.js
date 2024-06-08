// The starting file where we listen to the server
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION - Shutting down...');
  console.log(err.name, err.message);
  // must exit when uncaught exception to clean up the process
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connect successful'));

// if "save" this doc multiple times and having server running, error will encounter due to repetition
// changes can be viewed in Compass

// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 4.5,
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error:', err);
//   });

//console.log(app.get('env'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION - Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
