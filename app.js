const express = require('express');
const morgan = require('morgan');
const AppError = require('./util/AppError');
const globalErrorController = require('./controllers/errorController');

const app = express();

// useful middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// middleware
app.use(express.json());

//middleware to serve static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// routes
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find the route named ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
