import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Application
const app = express();

// middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// Routers Import
import userRouter from "./routes/user.routes.js";

// Routers implement
app.use("/api/v1/users", userRouter);

export default app;
