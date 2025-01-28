import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const userData = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
