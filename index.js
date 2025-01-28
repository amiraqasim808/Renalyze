import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import userRouter from "./src/modules/user/user.router.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = 3000;
//connect db
await connectDb();
//cors
const corsConfig = {
  origin: "",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
// const whiteList = ["http://127.0.0.1:5500"];
// app.use((req, res, next) => {
//   if(req.originalUrl.includes("/auth/activate_account")){
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET");
//     return next();
//   }
//   if (!whiteList.includes(req.header("origin"))) {
//     return next(new Error("blocked by CORS!"));
//   }
//   res.setHeader("Access-Control-Allow-Origin","*");
//   res.setHeader("Access-Control-Allow-Headers","*");
//   res.setHeader("Access-Control-Allow-Methods","*");
//   res.setHeader("Access-Control-Allow-Private-Network",true);
//   return next()
// });
//parsing
app.use((req, res, next) => {
  if (req.originalUrl === "/order/webhook") {
    return next();
  }
  express.json()(req, res, next);
});


//routers
app.use("/auth", authRouter);
app.use("/user", userRouter);
//page not found
app.all("*", (req, res, next) => {
  return next(new Error("page not found", { cause: 404 }));
});
//global error handler
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
});

app.listen(process.env.PORT || port, () => {
  console.log("app is running");
});
