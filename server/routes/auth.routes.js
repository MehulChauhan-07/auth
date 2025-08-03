import express from "express";
import csurf from "csurf";

const authRouter = express.Router();

import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyOtp,
  isAuthenticated,
  sendResetPasswordOtp,
  resetPassword,
  // refreshAccessToken,
} from "../controllers/auth.controller.js";
import userAuth from "../middleware/auth.middleware.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/auth.validators.js";
import csrfProtection from "../middleware/csrf.middleware.js";

authRouter.post("/register", csrfProtection, validateRegister, register);
authRouter.post("/login", csrfProtection, validateLogin, login);
authRouter.post("/logout", csrfProtection, logout);
authRouter.post("/send-otp", csrfProtection, userAuth, sendVerifyOtp);
authRouter.post("/verify-otp", csrfProtection, userAuth, verifyOtp);
authRouter.get("/is-authenticated", csrfProtection, userAuth, isAuthenticated);
authRouter.post("/forgot-password", csrfProtection, sendResetPasswordOtp);
authRouter.post("/reset-password", csrfProtection, resetPassword);
authRouter.get("/csrf-token", (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

// Testing routes without CSRF (only in development)
if (
  process.env.NODE_ENV === "development" ||
  process.env.DISABLE_CSRF === "true"
) {
  authRouter.post("/test/register", validateRegister, register);
  authRouter.post("/test/login", validateLogin, login);
  authRouter.post("/test/logout", logout);
  authRouter.post("/test/forgot-password", sendResetPasswordOtp);
  authRouter.post("/test/reset-password", resetPassword);
}

export default authRouter;
