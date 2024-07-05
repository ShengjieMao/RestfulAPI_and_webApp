// The File Only Deals with Express

const path = require('path');
const express = require('express');
const morgan = require('morgan'); // make log more readable
const rateLimit = require('express-rate-limit'); // limit the number of requests
const helmet = require('helmet'); // set security HTTP headers
const mongoSanitize = require('express-mongo-sanitize'); // prevent NoSQL query injection
const xss = require('xss-clean'); // prevent XSS
const hpp = require('hpp'); // prevent parameter pollution
const cookieParser = require('cookie-parser'); // parse cookies
const compression = require('compression'); // compress the response
const cors = require('cors'); // enable CORS

// Middlewares
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy'); // secure HTTPS connections

// Define the Pug engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // set the views folder

// 1. GLOBAL MIDDLEWARESs
// Implement CORS - enable all CORS requests
app.use(cors());
// Access-Control-Allow-Origin: *
// app.use(cors({
//   origin: 'http://www.appName.com',
//   credentials: true
// }));

app.options('*', cors()); // pre-flight phase

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

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // parse data from the body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // parse data from cookies

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

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3. Mounting routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
