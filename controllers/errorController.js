const AppError = require('../util/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  console.log(err);
  const message = `Duplicate field value: ${err.keyValue.name || err.keyValue.email}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('Invalid token. Please login Again', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('Your token has expired. Please Login Again');
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error/ Cast Error : send message to client

  if (err.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error😤', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!😤',
    });
  }
};

errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    sendErrorProd(error, res);
  }
};

module.exports = errorController;
