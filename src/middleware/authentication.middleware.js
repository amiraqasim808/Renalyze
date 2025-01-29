import { Token } from "../../DB/models/token.model.js";
import { User } from "../../DB/models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const isAthenticated = asyncHandler(async (req, res, next) => {
  let token = req.headers["token"];
  if (!token || !token.startsWith(process.env.BEARER_KEY)) {
    const error = new Error("valid token is required !");
    error.cause = 401;
    return next(error);
  }
  token = token.split(process.env.BEARER_KEY)[1];
   try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
   } catch (error) {
    error.cause = 401;
    return next(error);
   }
  
  

  const tokenDB = await Token.findOne({ token, isValid: true });
  if (!tokenDB) {
    const error = new Error("token expired!");
    error.cause = 401;
    return next(error);
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  req.user = user;
  req.token = token;
  return next();
});
