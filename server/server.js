import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieparser from "cookie-parser";
import connectDB from "./config/db.config.js";
import logger from "./utils/logger.js";
import helmet from "helmet";
// import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import csrfProtection, {
  handleCsrfError,
} from "./middleware/csrf.middleware.js";
import passport from "./config/passport.config.js";
import csrf from "csrf";
import session from "express-session";
import MongoStore from "connect-mongo";

// routes
import sessionRouter from "./routes/session.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import mfaRouter from "./routes/mfa.routes.js";
import oauthRouter from "./routes/oauth.routes.js";
import {
  apiLimiter,
  loginLimiter,
} from "./middleware/rateLimiter.middleware.js";
// import passport from "passport";

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

// middleware
// Security headers with helmet
app.use(express.json());
app.use(cookieparser());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  })
);
app.use(express.urlencoded({ extended: true }));

// CORS configuration
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      credentials: true,
      origin: function (origin, callback) {
        // Allow any origin in development
        callback(null, true);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
      ],
    })
  );
} else {
  app.use(cors({ credentials: true, origin: allowedOrigins }));
}

connectDB();

// Session configuration - must be before CSRF protection
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: "sessions",
      ttl: 60 * 60 * 24, // 1 day in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    },
  })
);

// apply CSRF protection middleware AFTER session and cookie parser
// Initialize CSRF protection
const tokens = new csrf();

// Conditionally apply CSRF protection
if (process.env.DISABLE_CSRF !== "true") {
  app.use((req, res, next) => {
    // Generate CSRF token
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }

    // Add CSRF token generator to request object
    req.csrfToken = function () {
      return tokens.create(req.session.csrfSecret);
    };

    // Add CSRF validation for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      // Skip CSRF for test routes
      if (!req.url.includes("/test/")) {
        const token = req.headers["x-csrf-token"] || req.body._csrf;

        if (!token || !tokens.verify(req.session.csrfSecret, token)) {
          return res.status(403).json({
            success: false,
            message: {
              code: "SEC_002",
              message: "Invalid or missing CSRF token",
            },
          });
        }
      }
    }

    next();
  });
} else {
  // Bypass CSRF when disabled
  app.use((req, res, next) => {
    req.csrfToken = function () {
      return "csrf-disabled";
    };
    next();
  });
}
// app.use(handleCsrfError);

// Initialize Passport strategies
app.use(passport.initialize());
app.use(passport.session());

// Add this route to your auth routes
app.get("/api/csrf-token", (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

// API endpoints
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Endpoint to check if server is accessible and properly configured
app.get("/api/status", (req, res) => {
  const serverInfo = {
    status: "running",
    timestamp: new Date().toISOString(),
    config: {
      environment: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      emailConfigured: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
    },
  };
  res.json(serverInfo);
});
// app.use("/api", apiLimiter); // Apply API rate limiter to specific route
app.use("/api/auth", authRouter);
app.use("/api/auth", oauthRouter);
app.use("/api/user", userRouter);
app.use("/api/mfa", mfaRouter);
app.use("/api/session", sessionRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Catch 404 routes
app.use((req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`Visit http://localhost:${process.env.PORT}`);
});

export default app;
