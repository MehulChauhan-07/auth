import winston from "winston";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "auth-service" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Write all logs error level and below to error.log
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Export logger instance
export default logger;
