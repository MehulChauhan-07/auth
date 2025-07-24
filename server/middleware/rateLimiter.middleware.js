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
  // Use a safe key generator that doesn't directly manipulate IP addresses
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || "0.0.0.0";
    const email = req.body?.email || "anonymous";
    return `${ip}-${email}`;
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
  // Default keyGenerator will be used (which is safe)
});
