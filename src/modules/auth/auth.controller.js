import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { signUpTemp } from "../../utils/htmlTemplates.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Token } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";

// Register
export const register = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (user) {
    const error = new Error("Email already exists");
    error.cause = 409;
    return next(error);
  }

  const token = jwt.sign(email, process.env.TOKEN_SECRET);
  await User.create({ ...req.body });

  // Use the request's host for the confirmation link
  const host = req.get("host");
  const protocol = req.protocol;
  const confirmationLink = `${protocol}://${host}/auth/activate_account/${token}`;

  const sentMessage = await sendEmail({
    to: email,
    subject: "Activate account",
    html: signUpTemp(confirmationLink),
  });
  if (!sentMessage) {
    const error = new Error("Something went wrong");
    error.cause = 500;
    return next(error);
  }

  return res.status(201).json({ success: true, message: "Check your email!" });
});

// Activate account
export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const email = jwt.verify(token, process.env.TOKEN_SECRET);
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  return res.status(200).json({ success: true, message: "You can login now" });
});

// Login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }
  if (!user.isConfirmed) {
    const error = new Error("Activate your account first");
    error.cause = 403;
    return next(error);
  }
if (user.isBlocked) {
  const error = new Error("Your account has been blocked!");
  error.cause = 403;
  return next(error);
}

  const match = bcryptjs.compareSync(password, user.password);
  if (!match) {
    const error = new Error("Incorrect password");
    error.cause = 401;
    return next(error);
  }

  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  await Token.create({ token, user: user._id });
  return res.status(200).json({ success: true, results: { token } });
});

// Send forget code
export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }
  if (!user.isConfirmed) {
    const error = new Error("Activate your account first!");
    error.cause = 403;
    return next(error);
  }

  const code = randomstring.generate({ length: 4, charset: "numeric" });
  user.forgetCode = code;
  await user.save();

  const messageSent = sendEmail({
    to: user.email,
    subject: "Forget password code",
    html: `<div>${code}</div>`,
  });
  if (!messageSent) {
    const error = new Error("Email invalid!");
    error.cause = 500;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: "You can reset password now. Check email!",
  });
});

// Verify code
export const verifyCode = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new Error("Email doesn't exist");
    error.cause = 404;
    return next(error);
  }

  if (user.forgetCode != req.body.forgetCode) {
    const error = new Error("Invalid code!");
    error.cause = 400;
    return next(error);
  }

  return res
    .status(200)
    .json({ success: true, message: "Code verified successfully" });
});

// Reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new Error("Email doesn't exist");
    error.cause = 404;
    return next(error);
  }

  user.password = req.body.password;
  await user.save();

  const tokens = await Token.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  await User.findOneAndUpdate(
    { email: req.body.email },
    { $unset: { forgetCode: 1 } }
  );

  return res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login.",
  });
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
  const token = req.token;

  const isToken = await Token.findOneAndUpdate({ token }, { isValid: false });
  if (!isToken) {
    const error = new Error("Invalid token!");
    error.cause = 401;
    return next(error);
  }

  return res.status(200).json({ success: true, message: "Logout successful" });
});

// Update password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  const match = bcryptjs.compareSync(oldPassword, user.password);
  if (!match) {
    const error = new Error("Incorrect old password");
    error.cause = 401;
    return next(error);
  }
  user.password = newPassword;
  await user.save();

  const tokens = await Token.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});
export const googleSignIn = asyncHandler(async (req, res, next) => {
  const { accessToken } = req.body;

  // Validate Google access token
  let userInfo;
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    userInfo = data;
  } catch (error) {
    return next(new Error("Invalid Google access token"));
  }

  const { sub: googleUserId, email, name, picture } = userInfo;

  if (!email) {
    return next(new Error("Google account must have an email"));
  }

  let user = await User.findOne({ email, isDeleted: false });

  if (user) {
    // 🔹 Blocked users can't log in
    if (user.isBlocked) {
      return next(new Error("Your account is blocked"));
    }

    // 🔹 If user exists but has no `googleUserId`, update it (link Google login)
    if (!user.googleUserId) {
      user.googleUserId = googleUserId;
      await user.save();
    }
  } else {
    // 🔹 New Google user signup
    user = await User.create({
      googleUserId,
      email,
      userName: name,
      profileImage: { url: picture },
      isConfirmed: true, // Google users are automatically verified
    });
  }

  // 🔹 Generate new authentication token
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);

  return res.status(200).json({ success: true, results: { token, user } });
});

// Soft delete user
export const softDeleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) return next(new Error("User not found"), { cause: 404 });

  const currentUser = req.user;
  if (currentUser.role !== "admin" && currentUser._id.toString() !== userId) {
    return next(new Error("You are not allowed to do this!"), { cause: 403 });
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { isDeleted: true }
  );

  const tokens = await Token.find({ user: userId });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  return res
    .status(200)
    .json({ success: true, message: "User has been soft deleted" });
});

// Get active users
export const getActiveUsers = asyncHandler(async (req, res, next) => {
  const activeUsers = await User.find({ isDeleted: false });
  return res.status(200).json({ success: true, users: activeUsers });
});

// Get deleted users
export const getDeletedUsers = asyncHandler(async (req, res, next) => {
  const deletedUsers = await User.find({ isDeleted: true });
  return res.status(200).json({ success: true, users: deletedUsers });
});

// Restore deleted user
export const restoreUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { isDeleted: false });
  if (!user) return next(new Error("User not found"), { cause: 404 });

  return res
    .status(200)
    .json({ success: true, message: "User has been restored" });
});
