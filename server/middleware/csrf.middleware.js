import csrf from "csurf";
import { AUTH_ERRORS } from "../constants/error.constants.js";

// CSRF protection middleware with environment check
const csrfProtection =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next() // Skip CSRF in test environment
    : csrf({
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
        },
      });

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
