import { Schema, model } from "mongoose";

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      min: 3,
      max: 100,
    },
    content: {
      type: String,
      required: true,
      min: 10,
      max: 5000,
    },
    image: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dwsiotrat/image/upload/v1705480608/default-article.jpg",
      },
      id: {
        type: String,
        default: "defaults/default-article",
      },
    },
    status: {
      type: String,
      enum: ["pending", "published", "archived"],
      default: "pending",
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Article = model("Article", articleSchema);
