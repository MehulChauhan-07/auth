import express from "express";
import { getUserData } from "../controllers/user.controller.js";
import userAuth from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);

export default userRouter;
