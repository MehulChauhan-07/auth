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

// Note: CSRF protection is handled at server level in server.js

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", logout);
authRouter.post("/send-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-otp", userAuth, verifyOtp);
authRouter.get("/is-authenticated", userAuth, isAuthenticated);
authRouter.post("/forgot-password", sendResetPasswordOtp);
authRouter.post("/reset-password", resetPassword);
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
