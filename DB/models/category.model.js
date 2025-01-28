import { Schema, Types, model } from "mongoose";
import { Subcategory } from "./subcategory.model.js";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 15,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    brandId: {
      type: Types.ObjectId,
      ref: "Brand",
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
categorySchema.virtual("subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "categoryId",
});

categorySchema.post(
  "deleteOne",
  { query: false, document: true },
  async function () {
    await Subcategory.deleteMany({ categoryId: this._id });
  }
);
export const Category = model("Category", categorySchema);
