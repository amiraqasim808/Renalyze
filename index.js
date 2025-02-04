import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import userRouter from "./src/modules/user/user.router.js";
import adminRouter from "./src/modules/dashboard/dashboard.router.js";
import doctorRouter from "./src/modules/doctor/doctor.router.js";
import articleRouter from "./src/modules/article/article.router.js";
import postRouter from "./src/modules/post/post.router.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = 3000;

// Connect DB
await connectDb();

// CORS Configuration (Allow Access from Anywhere)
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["*"], // Allow all headers
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); // Handle preflight requests

// Parsing
app.use((req, res, next) => {
  if (req.originalUrl === "/order/webhook") {
    return next();
  }
  express.json()(req, res, next);
});

// Routers
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/doctor", doctorRouter);
app.use("/article", articleRouter);
app.use("/post", postRouter);

// Page Not Found
app.all("*", (req, res, next) => {
  return next(new Error("page not found", { cause: 404 }));
});

// Global Error Handler
app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    stack: error.stack,
  });
});

// Start Server
app.listen(process.env.PORT || port, () => {
  console.log("app is running");
});
