import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import * as userController from "../user/user.controller.js";
import * as userSchema from "../user/user.controller.js";

const router = Router();

// get user data
router.get("/", isAthenticated, isAuthorized("user"), userController.userData);

export default router;
