import express from "express";
import {
  setupMfa,
  verifyAndEnableMfa,
  disableMfaForUser,
  verifyMfaLogin,
} from "../controllers/mfa.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const mfaRouter = express.Router();

// Routes that require authentication
mfaRouter.post("/setup", authMiddleware, setupMfa);
mfaRouter.post("/enable", authMiddleware, verifyAndEnableMfa);
mfaRouter.post("/disable", authMiddleware, disableMfaForUser);

// Route for MFA verification during login (doesn't require auth middleware)
mfaRouter.post("/verify", verifyMfaLogin);

export default mfaRouter;
