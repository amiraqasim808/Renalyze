import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Who receives the notification
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Who triggered the action
    type: { type: String, enum: ["comment", "reply", "like"], required: true }, // Type of notification
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    }, // Optional post reference
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // Optional comment reference
    isRead: { type: Boolean, default: false }, // Read status
    message:String
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
