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
      required: function () {
        return !this.googleUserId; // Password is required only if Google ID is missing
      },
    },
    googleUserId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users with null Google IDs
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Hash password only if it exists and is modified
userSchema.pre("save", function () {
  if (this.password && this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});

export const User = model("User", userSchema);
