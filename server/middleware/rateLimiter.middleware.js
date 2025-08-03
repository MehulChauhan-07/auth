import { rateLimit } from "express-rate-limit";
import { AUTH_ERRORS } from "../constants/error.constants.js";

// Temporarily disable rate limiters for development
const isDevMode = process.env.NODE_ENV === "development";

// Create a rate limiter for login attempts
export const loginLimiter = isDevMode
  ? (req, res, next) => next() // Bypass in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true, // Only count failed attempts
      message: {
        success: false,
        message: AUTH_ERRORS.TOO_MANY_ATTEMPTS,
      },
    });
// General API rate limiter
export const apiLimiter = isDevMode
  ? (req, res, next) => next() // Bypass in development
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 requests per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later",
      },
    });
