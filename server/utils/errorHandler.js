import logger from "./logger.js";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(statusCode, message, errorCode = null, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
    this.isOperational = true; // Indicates operational error vs programming error

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errorCode = null, data = null) {
    return new ApiError(400, message, errorCode, data);
  }

  static unauthorized(message, errorCode = null, data = null) {
    return new ApiError(401, message, errorCode, data);
  }

  static forbidden(message, errorCode = null, data = null) {
    return new ApiError(403, message, errorCode, data);
  }

  static notFound(message, errorCode = null, data = null) {
    return new ApiError(404, message, errorCode, data);
  }

  static internal(message, errorCode = null, data = null) {
    return new ApiError(500, message, errorCode, data);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Error caught by global handler", {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode,
    path: req.path,
    method: req.method,
    isOperational: err.isOperational || false,
  });

  // Determine if error is operational or programming
  const isOperational = err.isOperational || false;

  // Send appropriate response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errorCode: err.errorCode || null,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      data: err.data || null,
    }),
  });

  // If this is a critical error, take appropriate actions
  if (!isOperational) {
    // This could be a programming error that needs immediate attention
    // Consider adding alerts or notifications for non-operational errors
  }
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
export const setupErrorHandlers = () => {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      error: error.message,
      stack: error.stack,
    });
    console.error("UNCAUGHT EXCEPTION! Shutting down...");
    // Give logger time to write logs before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on("unhandledRejection", (error) => {
    logger.error("Unhandled Promise Rejection", {
      error: error.message,
      stack: error.stack,
    });
    console.error("UNHANDLED REJECTION! Shutting down...");
    // Give logger time to write logs before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};
