const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   passwordChangedAt: req.body.passwordChangedAt,
  //   role: req.body.role,
  // });

  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) check if user exists
  const user = await User.findOne({ email }).select('+password');

  // compare input password and db stored password

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it is there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('you are not logged in! Please log in to get access', 401),
    );
  }
  // 2) verfication of token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  // 3) check if user already exist
  const fetchedUser = await User.findById(decoded.id);

  if (!fetchedUser) {
    return next(
      new AppError('The User Belonging to this token does not  exist', 401),
    );
  }
  // 4) check if user changed password after the token was issued

  if (fetchedUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!  please login again', 401),
    );
  }

  // 5) grant access to protected route

  req.user = fetchedUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles  ['admin','lead-guide']

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permisson to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    message: 'Token sent to email',
    token: resetToken,
  });
  // 3) send it to user's email
});

exports.resetPassword = (req, res, next) => {};
