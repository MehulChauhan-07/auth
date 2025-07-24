
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieparser from "cookie-parser";
import connectDB from "./config/db.config.js";
import logger from "./utils/logger.js";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import csrfProtection, {
  handleCsrfError,
} from "./middleware/csrf.middleware.js";

// routes
// import sessionRouter from "./routes/session.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import mfaRouter from "./routes/mfa.routes.js";


const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

// middleware
app.use(helmet());
app.use(express.json());
app.use(cookieparser());
app.use(cors({ credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// More permissive CORS for development
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      credentials: true,
      origin: function (origin, callback) {
        // Allow any origin in development
        callback(null, true);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );
} else {
  app.use(cors({ credentials: true, origin: allowedOrigins }));
}


connectDB();

// apply CSRF protection middleware
app.use(csrfProtection);
app.use(handleCsrfError);

// generate CSRF token for each request
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
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
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/mfa", mfaRouter);


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