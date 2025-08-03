import express from "express";
import {
  setupMfa,
  verifyAndEnableMfa,
  disableMfaForUser,
  verifyMfaLogin,
} from "../controllers/mfa.controller.js";
import userAuth from "../middleware/auth.middleware.js";

const mfaRouter = express.Router();

// Routes that require authentication
mfaRouter.post("/setup", userAuth, setupMfa);
mfaRouter.post("/enable", userAuth, verifyAndEnableMfa);
mfaRouter.post("/disable", userAuth, disableMfaForUser);

// Route for MFA verification during login (doesn't require auth middleware)
mfaRouter.post("/verify-login", verifyMfaLogin);

export default mfaRouter;
