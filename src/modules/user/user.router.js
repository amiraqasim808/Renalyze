import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as userController from "../user/user.controller.js";
import * as userSchema from "../user/user.controller.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

// get user data
router.get("/", isAuthenticated, userController.userData);
// update user's profile
router.post(
  "/updateProfile",
  isAuthenticated,
  fileUpload(filterObject.image).single("img"),
  userController.updateUserProfile
);
// get diagnosis
router.post(
  "/diagnose",
  isAuthenticated,
  isAuthorized("user"),
  fileUpload(filterObject.image).single("scanFile"),
  userController.getKidneyScanDiagnosis
);
// Get Past Kidney Scan Diagnoses
router.get(
  "/pastResults",
  isAuthenticated,
  isAuthorized("user"),
  userController.getPastKidneyScanDiagnoses
);
// Get a specific past kidney scan diagnosis by ID
router.get(
  "/pastResults/:id",
  isAuthenticated,
  isAuthorized("user"),
  userController.getSpecificKidneyScanDiagnosis
);

export default router;
