import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: [
      {
        url: {
          type: String,
        },
        id: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
// Virtual for replies count
replySchema.virtual("likesCount", {
  ref: "Like", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "targetId", // Replies reference this field
  count: true, // Return an array of replies
});
// Virtual for replies count
replySchema.virtual("likes", {
  ref: "Like", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "targetId", // Replies reference this field
});
export const Reply = mongoose.model("Reply", replySchema);
