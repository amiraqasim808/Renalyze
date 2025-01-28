import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { signUpTemp } from "../../utils/htmlTemplates.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Token } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

//register
export const register = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (user) return next(new Error("email already exists"), { cause: 409 });

  const token = jwt.sign(email, process.env.TOKEN_SECRET);
  await User.create({ ...req.body });
  const confirmatinLink = `http://localhost:3000/auth/activate_account/${token}`;
  const sentMessage = await sendEmail({
    to: email,
    subject: "activate account",
    html: signUpTemp(confirmatinLink),
  });
  if (!sentMessage) return next(new Error("something went wrong "));
  return res.status(201).json({ success: true, message: "check your email!" });
});

//activate account
export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const email = jwt.verify(token, process.env.TOKEN_SECRET);
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });
  if (!user) return next(new Error("user not found "), { cause: 404 });
  //create cart
  await Cart.create({ user: user._id });
  return res.json({ success: true, message: "you can login now" });
});
//login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) return next(new Error("user not found"), { cause: 404 });
  if (!user.isConfirmed)
    return next(new Error("you must activate your account first "));
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("incorrect password"));
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  await Token.create({ token, user: user._id });
  return res.status(201).json({ success: true, resaults: { token } });
});
//////////////////////forget code//////////////////////

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("user not found"));
  if (!user.isConfirmed)
    return next(new Error("you must activate your account first!"));
  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });
  user.forgetCode = code;
  await user.save();
  const messageSent = sendEmail({
    to: user.email,
    subject: "forget password code",
    html: `<div>${code}</div>`,
  });
  if (!messageSent) return next(new Error("email invalid!"));
  return res.send("you can reset password now check email");
});
//////////////////////reset password//////////////////////

export const resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("email doesn't exist", { cause: 404 }));
  if (user.forgetCode != req.body.forgetCode) {
    return next(new Error("invalid code!"));
  }

  user.password = req.body.password;
  await user.save();
  // invalidate all tokens
  const tokens = await Token.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  await User.findOneAndUpdate(
    { email: req.body.email },
    { $unset: { forgetCode: 1 } }
  );
  return res.json({ success: true, message: "you can login now" });
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
  const token = req.token;

  const isToken = await Token.findOneAndUpdate({ token }, { isValid: false });
  if (!isToken) return next(new Error("invalid token!"));
  // Send a response indicating successful logout
  res.json({ success: true, message: "Logout successful" });
});

// Update password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  // Check if the user exists and password matches
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    return next(new Error("User not found"), { cause: 404 });
  }
  const match = bcryptjs.compareSync(oldPassword, user.password);
  if (!match) {
    return next(new Error("Incorrect old password"));
  }

  // Update the password
  user.password = newPassword;
  await user.save();
  // invalidate all tokens
  const tokens = await Token.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  res.json({ success: true, message: "Password updated successfully" });
});

// Soft delete user
export const softDeleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Fetch the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return next(new Error("User not found"), { cause: 404 });
  }

  // Check if the logged-in user is an admin or the user themselves
  const currentUser = req.user;
  if (currentUser.role !== "admin" && currentUser._id.toString() !== userId) {
    return next(new Error("You are not allowed to do this!"), { cause: 403 });
  }

  // Soft delete the user
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { isDeleted: true }
  );

  // Invalidate all tokens associated with the deleted user
  const tokens = await Token.find({ user: userId });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  res.json({ success: true, message: "User has been soft deleted" });
});

// Get active users
export const getActiveUsers = asyncHandler(async (req, res, next) => {
  const activeUsers = await User.find({ isDeleted: false });
  res.json({ success: true, users: activeUsers });
});

// Get deleted users
export const getDeletedUsers = asyncHandler(async (req, res, next) => {
  const deletedUsers = await User.find({ isDeleted: true });
  res.json({ success: true, users: deletedUsers });
});

// Restore deleted user
export const restoreUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { isDeleted: false });
  if (!user) {
    return next(new Error("User not found"), { cause: 404 });
  }
  res.json({ success: true, message: "User has been restored" });
});
