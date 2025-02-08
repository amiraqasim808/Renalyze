import { Router } from "express";
import * as reportController from "./report.controller.js";
import * as reportSchema from "./report.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

// ✅ Create a Report
router.post(
  "/add",
  isAuthenticated,
  validation(reportSchema.addReportSchema),
  reportController.addReport
);

// ✅ Get All Reports (Admin Only)
router.get(
  "/all",
  isAuthenticated,
  isAuthorized("admin"),
  reportController.getReports
);

// ✅ Get Report by ID (Admin Only)
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  reportController.getReportById
);

// ✅ Update Report Status (Admin Only)
router.patch(
  "/update/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(reportSchema.updateReportStatusSchema),
  reportController.updateReportStatus
);

// ✅ Delete Report (Admin Only)
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("admin"),
  reportController.deleteReport
);

export default router;
