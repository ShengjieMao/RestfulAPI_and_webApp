// Only deal with express

const express = require('express');
const morgan = require('morgan'); // make log more readable

// Middlewares
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // log the request
}

app.use(express.json()); // use the middleware
app.use(express.static(`${__dirname}/public`)); // serve static files

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next(); // always need the next() to process
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3. Mounting ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
