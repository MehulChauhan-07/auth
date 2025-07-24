export const AUTH_ERRORS = {
  // Authentication Errors
  UNAUTHORIZED: {
    code: "AUTH_001",
    message: "You are not authorized to access this resource",
  },
  INVALID_TOKEN: {
    code: "AUTH_002",
    message: "Authentication token is invalid or expired",
  },
  INVALID_REFRESH_TOKEN: {
    code: "AUTH_003",
    message: "Refresh token is invalid or expired",
  },
  INVALID_CREDENTIALS: {
    code: "AUTH_004",
    message: "Email or password is incorrect",
  },

  // User Errors
  USER_NOT_FOUND: {
    code: "USER_001",
    message: "User not found",
  },
  USER_ALREADY_EXISTS: {
    code: "USER_002",
    message: "User with this email already exists",
  },

  // Account Status Errors
  ACCOUNT_ALREADY_VERIFIED: {
    code: "ACC_001",
    message: "Account is already verified",
  },
  ACCOUNT_NOT_VERIFIED: {
    code: "ACC_002",
    message: "Please verify your account before proceeding",
  },
  ACCOUNT_LOCKED: {
    code: "ACC_003",
    message:
      "Account is temporarily locked due to multiple failed login attempts",
  },

  // OTP Errors
  INVALID_OTP: {
    code: "OTP_001",
    message: "The OTP you entered is invalid",
  },
  OTP_EXPIRED: {
    code: "OTP_002",
    message: "The OTP has expired, please request a new one",
  },

  // Request Errors
  REQUIRED_ALL_FIELDS: {
    code: "REQ_001",
    message: "Please fill all required fields",
  },
  INVALID_REQUEST: {
    code: "REQ_002",
    message: "Invalid request parameters",
  },

  // Security Errors
  TOO_MANY_ATTEMPTS: {
    code: "SEC_001",
    message: "Too many attempts, please try again later",
  },
  INVALID_CSRF_TOKEN: {
    code: "SEC_002",
    message: "Invalid or missing CSRF token",
  },

  // Session Errors
  SESSION_NOT_FOUND: {
    code: "SES_001",
    message: "Session not found or already expired",
  },
  SESSION_TERMINATED: {
    code: "SES_002",
    message: "Session has been terminated",
  },
};

export const USER_ERRORS = {
  NOT_FOUND: "User not found",
  UNAUTHORIZED: "You are not authorized to access this resource",
  INVALID_ID: "Invalid user ID format",
};

export const SERVER_ERRORS = {
  INTERNAL_SERVER_ERROR: "An internal server error occurred",
  DATABASE_ERROR: "Database connection error",
  EMAIL_SENDING_FAILED: "Failed to send email",
};
