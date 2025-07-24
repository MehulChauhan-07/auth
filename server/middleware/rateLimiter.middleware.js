import { rateLimit } from "express-rate-limit";
import { AUTH_ERRORS } from "../constants/error.constants.js";

// Create a rate limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: AUTH_ERRORS.TOO_MANY_ATTEMPTS,
  },
  keyGenerator: (req) => {
    // Use IP address and email as the key
    return `${req.ip}-${req.body.email}`;
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
