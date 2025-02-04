import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as adminController from "./dashboard.controller.js";
import {login}  from "../auth/auth.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";

const router = Router();


//login
router.post("/login" ,validation(login), adminController.loginAdmin);
//block unblock user
router.post("/blockUser/:id", isAuthenticated,isAuthorized("admin"), adminController.blockUser);
// get stats
router.get(
  "/dashboard-stats",
  isAuthenticated,
  isAuthorized("admin"),
  adminController.getDashboardStats
);
// get user growth
router.get(
  "/UserGrowth",
  isAuthenticated,
  isAuthorized("admin"),
  adminController.getUserGrowth
);

export default router;
