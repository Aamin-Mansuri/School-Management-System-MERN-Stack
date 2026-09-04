import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  sendError(res, 404, `API Route Not Found: ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    message = `Resource not found with ID of ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 400;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message).join(', ');
    statusCode = 422;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token.';
    statusCode = 401;
  }

  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? [err.stack] : []
  );
};
