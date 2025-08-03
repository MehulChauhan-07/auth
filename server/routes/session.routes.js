import express from "express";
import {
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
} from "../controllers/session.controller.js";
import userAuth from "../middleware/auth.middleware.js";

const sessionRouter = express.Router();

// Get all active sessions for current user
sessionRouter.get("/", userAuth, getActiveSessions);

// Terminate specific session
sessionRouter.delete("/:sessionId", userAuth, revokeSession);

// Terminate all sessions except current one
sessionRouter.delete("/", userAuth, revokeAllSessions);

export default sessionRouter;
