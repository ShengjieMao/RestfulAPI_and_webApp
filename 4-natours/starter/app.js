// Only deal with express

const express = require('express');
const morgan = require('morgan'); // make log more readable

// Middlewares
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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
  req.requestTime = new Date().toISOString();
  next();
});

// 3. Mounting routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 4. Handling unhandled routes
app.all('*', (req, res) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware for handling all errors
app.use(globalErrorHandler);

module.exports = app;
