import { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, min: 2, max: 20, required: true, unique: true },
    description: String,
    images: [
      {
        id: { required: true, type: String },
        url: { required: true, type: String },
      },
    ],
    defaultImage: {
      id: { required: true, type: String },
      url: { required: true, type: String },
    },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category" },
    subCategory: { type: Types.ObjectId, ref: "Subcategory" },
    brand: { type: Types.ObjectId, ref: "Brand" },
    cloudFolder: { type: String, unique: true },
    averageRate: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  }
);
productSchema.virtual("finalPrice").get(function () {
  if (this.price) {
    return Number.parseFloat(
      this.price - (this.price * this.discount || 0) / 100
    ).toFixed(2);
  }
});
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

productSchema.query.paginate = function (page) {
  const limit = 1;
  page = page < 0 || isNaN(page) || !page ? 1 : page;
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};
productSchema.query.search = function (keyword) {
  if (keyword) return this.find({ name: { $regex: keyword, $options: "i" } });
  else return this;
};
productSchema.methods.inStock = function (requiredQuantity) {
  return this.availableItems >= requiredQuantity;
};
export const Product = model("Product", productSchema);
