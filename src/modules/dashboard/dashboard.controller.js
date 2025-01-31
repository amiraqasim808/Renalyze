import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token } from "../../../DB/models/token.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await User.findOne({
    email,
    role: "admin",
    isDeleted: false,
  });
  if (!admin) {
    const error = new Error("This admin not found");
    error.cause = 404;
    return next(error);
  }
  const isValidPassword = bcryptjs.compareSync(password, admin.password);
  if (!isValidPassword) {
    const error = new Error("Invalid credentials");
    error.cause = 400;
    return next(error);
  }
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  await Token.create({ token, user: admin._id });

  await admin.save();
  res.status(200).json({ message: "Logged in successfully", data: token });
});
//logout & update password from regular users 
export const blockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Get user ID from request params

  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  // Prevent blocking another admin
  if (user.role === "admin") {
    const error = new Error("You cannot block an admin");
    error.cause = 403;
    return next(error);
  }

  // Toggle user block status
  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User has been ${
      user.isBlocked ? "blocked" : "unblocked"
    } successfully`,
  });
});
