import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    forgetCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dwsiotrat/image/upload/v1705480608/E_Commerce/users/defaults/profilePic/avatar_baqtea.webp",
      },
      id: {
        type: String,
        default: "E_Commerce/users/defaults/profilePic/avatar_baqtea",
      },
    },
    coverImages: [{ url: { type: String }, id: { type: String } }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});
export const User = model("User", userSchema);
