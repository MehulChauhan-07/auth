import express from "express";

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
} from "../controllers/auth.controller.js";
import userAuth from "../middleware/auth.middleware.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/auth.validators.js";

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", logout);
authRouter.post("/send-verification-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-otp", userAuth, verifyOtp);
authRouter.get("/is-authenticated", userAuth, isAuthenticated);
authRouter.post("/forgot-password", sendResetPasswordOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
