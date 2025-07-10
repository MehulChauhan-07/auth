export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User with this email already exists",
  UNAUTHORIZED: "You are not authorized to perform this action",
  INVALID_TOKEN: "Invalid or expired token",
  ACCOUNT_NOT_VERIFIED: "Please verify your account first",
  ACCOUNT_ALREADY_VERIFIED: "Account already verified",
  INVALID_OTP: "Invalid OTP provided",
  OTP_EXPIRED: "OTP has expired",
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
