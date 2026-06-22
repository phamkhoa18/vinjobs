import AppError from '../utils/AppError.js';

const handleCastErrorDB = (err) => {
  const message = `ID không hợp lệ: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Extract the field value
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
  const message = `Giá trị ${value} đã tồn tại. Vui lòng dùng giá trị khác!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

const handleJWTExpiredError = () =>
  new AppError('Token đã hết hạn! Vui lòng đăng nhập lại.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
    });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  // Fix lỗi JWT trả về 500 ở môi trường Dev
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
