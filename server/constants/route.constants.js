export const API_PREFIX = "/api";

export const AUTH_ROUTES = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  VERIFY_OTP: "/auth/verify",
  SEND_VERIFY_OTP: "/auth/send-verify-otp",
  SEND_RESET_PASSWORD_OTP: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  IS_AUTHENTICATED: "/auth/is-authenticated",
};

export const USER_ROUTES = {
  GET_PROFILE: "/user/data",
  UPDATE_PROFILE: "/user/update",
};
