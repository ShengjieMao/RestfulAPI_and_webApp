// The File Only Deals with Express

const path = require('path');
const express = require('express');
const morgan = require('morgan'); // make log more readable
const rateLimit = require('express-rate-limit'); // limit the number of requests
const helmet = require('helmet'); // set security HTTP headers
const mongoSanitize = require('express-mongo-sanitize'); // prevent NoSQL query injection
const xss = require('xss-clean'); // prevent XSS
const hpp = require('hpp'); // prevent parameter pollution

// Middlewares
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Define the Pug engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // set the views folder

// 1. GLOBAL MIDDLEWARES
// Serving static files
// app.use(express.static(`${__dirname}/public`)); // serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet()); // set security HTTP headers

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // log the request
}

// Limit the number of requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this address, please try again in an hour.',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // use the middleware

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3. Mounting routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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