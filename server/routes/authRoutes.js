import express from "express";

const authRouter = express.Router();

import { register, login, logout } from "../controllers/auth.controller.js";

// Middleware to protect routes

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", logout);

export default authRouter;