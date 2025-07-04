import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import * as doctorSchema from "./doctor.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

// ✅ Create a Doctor
router.post(
  "/add",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("img"),
  validation(doctorSchema.addDoctorSchema),
  doctorController.addDoctor
);

// ✅ Get All Doctors
router.get("/all", doctorController.getDoctors);
// ✅ Get Top Rated Doctors
router.get("/topRated", doctorController.getTopRatedDoctors);

// ✅ Get Doctor by ID
router.get("/:id", doctorController.getDoctorById);

//update doctor
router.patch(
  "/update/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("img"), // To handle image upload for update
  validation(doctorSchema.updateDoctorSchema),
  doctorController.updateDoctor
);

// ✅ Delete Doctor
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("admin"),
  doctorController.deleteDoctor
);

export default router;
