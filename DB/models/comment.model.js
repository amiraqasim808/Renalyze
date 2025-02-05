import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
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
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Reply", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "commentId", // Replies reference this field
  justOne: false, // Return an array of replies
});
// Virtual for replies count
commentSchema.virtual("repliesCount", {
  ref: "Reply", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "commentId", // Replies reference this field
  count: true, // Return an array of replies
});
// Virtual for replies count
commentSchema.virtual("likesCount", {
  ref: "Like", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "targetId", // Replies reference this field
  count: true, // Return an array of replies
});
// Virtual for replies count
commentSchema.virtual("likes", {
  ref: "Like", // The model to reference
  localField: "_id", // Comment's ID
  foreignField: "targetId", // Replies reference this field
});

export const Comment = mongoose.model("Comment", commentSchema);
