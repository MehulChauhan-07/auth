import express from "express";
import { getUserData } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/data", authMiddleware, getUserData);

export default userRouter;
