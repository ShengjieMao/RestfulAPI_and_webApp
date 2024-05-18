const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); // make log more readable

const app = express();
app.use(express.json()); // use the middleware

// 1. MIDDLEWARES

app.use(morgan('dev')); // log the request
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next(); // always need the next() to process
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

// 2. ROUTE HANDLERS

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length, // include this when sending back multiple data
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);
  // convert id to number and use find to return quanlified tour
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === req.params.id * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  // push the tour to the database
  tours.push(newTour);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    // 201 - created
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// CRUD functions of the app
// app.get('api/v1/tours', getAllTours);
// app.post('api/v1/tours', createTour);
// app.get('api/v1/:id', getTour);
// app.patch('api/v1/tours/:id', updateTour);
// app.delete('api/v1/tours/:id', deleteTour);

// 3. ROUTES

// mounting routers
const tourRouter = express.Router();
const userROuter = express.Router();
// refer to the route of the tourRouter
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
userROuter.route('/api/v1/users').get(getAllUsers).post(createUser);
userROuter.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userROuter);

// 4. START SERVER

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
