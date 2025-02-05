import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment", "Reply"], // Specify the allowed types
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can like a specific target only once
likeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
