import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

const router = Router();

// ✅ Get All Notifications
router.get("/all", isAuthenticated, notificationController.getNotifications);


// ✅ Mark All Notifications as Read
router.patch(
  "/read-all",
  isAuthenticated,
  notificationController.markAllAsRead
);

// ✅ Delete a Notification
router.delete(
  "/delete/:id",
  isAuthenticated,
  notificationController.deleteNotification
);

export default router;
