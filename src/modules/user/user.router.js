import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as userController from "../user/user.controller.js";
import * as userSchema from "../user/user.controller.js";

const router = Router();

// get user data
router.get("/", isAuthenticated, isAuthorized("user"), userController.userData);

export default router;
