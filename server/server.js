import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import cookieparser from 'cookie-parser';
import connectDB from './config/db.js';
const app = express();

app.use(express.json());
app.use(cookieparser())
app.use(cors({credentials: true}));

connectDB();

// API endpoints
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.use("/api/auth",authRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the app.`);
});