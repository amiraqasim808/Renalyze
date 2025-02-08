import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedItem: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },
    itemType: {
      type: String,
      required: true,
      enum: ["User", "Post", "Comment", "Reply"],
    },
    reason: {
      type: String,
      required: true,
      enum: ["spam", "harassment", "inappropriate", "other"],
    },
    description: { type: String, max: 500 }, // Optional description by user
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report = model("Report", reportSchema);
