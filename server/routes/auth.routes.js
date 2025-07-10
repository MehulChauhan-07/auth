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
import userAuth from "../middleware/userAuth.middleware.js";

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verifyAccount", userAuth, verifyOtp);
authRouter.post("/isAuth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetPasswordOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
