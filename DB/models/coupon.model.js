import { Schema, Types, model } from "mongoose";

const coupnSchema = new Schema(
  {
    name: { type: String, required: true },
    discount: { type: Number, min: 1, max: 100, required: true },
    expiredAt: Number,
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Coupon = model("Coupon", coupnSchema);
