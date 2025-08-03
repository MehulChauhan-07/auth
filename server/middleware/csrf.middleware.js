import csrf from "csurf";
import { AUTH_ERRORS } from "../constants/error.constants.js";

// CSRF protection middleware with environment check
const csrfProtection = (req, res, next) => {
  // Skip CSRF in test environment or when disabled
  if (process.env.NODE_ENV === "test" || process.env.DISABLE_CSRF === "true") {
    return next();
  }

  // Check if CSRF token is provided in header
  const token = req.headers["x-csrf-token"];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: AUTH_ERRORS.INVALID_CSRF_TOKEN,
    });
  }

  // Validate the token
  if (!req.validateCsrf || !req.validateCsrf(token)) {
    return res.status(403).json({
      success: false,
      message: AUTH_ERRORS.INVALID_CSRF_TOKEN,
    });
  }

  next();
};

// Error handler for CSRF errors
export const handleCsrfError = (err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // Handle CSRF token errors
  return res.status(403).json({
    success: false,
    message: AUTH_ERRORS.INVALID_CSRF_TOKEN,
  });
};

export default csrfProtection;
