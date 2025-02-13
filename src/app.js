import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Application
const app = express();

// middlewares
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN_PROD, process.env.CROS_ORIGIN_LOCAL],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// Routers Import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";

// Routers implement
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);

export default app;
