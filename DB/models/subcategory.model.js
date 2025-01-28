import mongoose, { Schema, Types, model } from "mongoose";

const subcategorySchema = new Schema(
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
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: [
      {
        type: Types.ObjectId,
        ref: "Brand",
      },
    ],
  },
  { timestamps: true }
);

export const Subcategory =
  mongoose.models.Subcategory || model("Subcategory", subcategorySchema);
