import { Token } from "../../DB/models/token.model.js";
import { User } from "../../DB/models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const isAthenticated = asyncHandler(async (req, res, next) => {
  let token = req.headers["token"];
  if (!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("valid token is required !"));
  token = token.split(process.env.BEARER_KEY)[1];
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  if (!decoded) return next(new Error("invalid token!"));
  const tokenDB = await Token.findOne({ token, isValid: true });
  if (!tokenDB) return next(new Error("token expired!"));
  const user = await User.findOne({ email: decoded.email });
  if (!user) return next(new Error("User not found"));
  req.user = user;
  req.token = token;
  return next();
});
