import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// get user data
export const userData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(
    req.user._id,
    "userName email phone profileImage coverImages -_id"
  );
  return res.json({ success: true, resaults: { user } });
});
