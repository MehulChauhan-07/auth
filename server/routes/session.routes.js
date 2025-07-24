import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getUserSessions,
  terminateSession,
  terminateAllSessions,
} from "../controllers/session.controller.js";

const sessionRouter = express.Router();

// All routes require authentication
sessionRouter.use(authMiddleware);

// Get all active sessions for current user
sessionRouter.get("/", getUserSessions);

// Terminate specific session
sessionRouter.delete("/:sessionId", terminateSession);

// Terminate all sessions except current one
sessionRouter.delete("/", terminateAllSessions);

export default sessionRouter;
