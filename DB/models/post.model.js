import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    tag: {
      type: String,
      enum: ["Question", "Advice", "Healing story"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Allow virtuals in JSON response
    toObject: { virtuals: true }, // Allow virtuals in object form
  }
);

// Virtual for Likes
postSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "postId",
  count: true, // Return count of likes
});

// Virtual for Comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

// Virtual for Comment Count
postSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true, // Return count of comments
});

export const Post = mongoose.model("Post", postSchema);
