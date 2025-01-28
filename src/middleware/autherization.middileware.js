import { asyncHandler } from "../utils/asyncHandler.js";

export const isAuthorized = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;
    // Check if the user's role is included in the provided roles
    if (!roles.includes(userRole)) {
      return next(
        new Error("You are not authorized to do that!", { cause: 403 })
      );
    }

    return next();
  });
};
