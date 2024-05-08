const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken');
const sendEmail = require('../util/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// ! signup middleware
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

  createSendToken(newUser, 201, res);
});

// ! login middleware

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // * 1) if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // * 2) check if user exists
  const user = await User.findOne({ email }).select('+password');

  //  compare input password and db stored password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // * 3) if everything ok, send token to client

  createSendToken(user, 200, res);
});

// ! route protection middleware

exports.protect = catchAsync(async (req, res, next) => {
  // * 1) Getting token and check if it is there

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
  // * 2) verfication of token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  // * 3) check if user already exist
  const fetchedUser = await User.findById(decoded.id);

  if (!fetchedUser) {
    return next(
      new AppError('The User Belonging to this token does not  exist', 401),
    );
  }
  // * 4) check if user changed password after the token was issued

  if (fetchedUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!  please login again', 401),
    );
  }

  // * 5) grant access to protected route

  req.user = fetchedUser;
  next();
});

// ! ristrict middleware
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

// ! forgot password middleware
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // * 1)  get user based on posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //  * 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // * 3) send it to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
      // html: `<p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: <a>${resetURL}</a>.</p>
      // <p>If you didn't forget your password, please ignore this email!</p>`,
    });
    res.json({
      status: 'success',
      message: 'Token sent to email',
      // token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }

  // don't send the token to the client
});

// ! reset password middleware
exports.resetPassword = catchAsync(async (req, res, next) => {
  // * 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // * 2) if token is not expired, and their is a user, set the new password

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // * 3) chnage passwordChangedAt property for the user

  // *  4) log the user in, send JWT
  createSendToken(user, 200, res);
});

// ! update password middleware

exports.updatePassword = catchAsync(async (req, res, next) => {
  // * 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // * 2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // * 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // * 4) log user in, send JWT

  // createSendToken(user, 200, res);

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
