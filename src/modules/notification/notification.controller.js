import { Notification } from "../../../DB/models/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ✅ Get All Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ userId })
    .populate("actorId", "profileImage userName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    notifications,
  });
});

// ✅ Mark All Notifications as Read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// ✅ Delete a Notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    return res
      .status(404)
      .json({ success: false, message: "Notification not found" });
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

