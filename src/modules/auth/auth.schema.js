import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

//register
export const register = joi
  .object({
    userName: joi.string().required().min(3).max(20),
    email: joi.string().email().required(),
    password: joi.string().required().pattern(new RegExp(`^.{8,}$`)),
    confirmPassword: joi.string().required().valid(joi.ref("password")),
  })
  .required();

//activateAccount
export const activateAccount = joi
  .object({
    token: joi.string().required(),
  })
  .required();

//login
export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();
// forget code

export const forgetCodeSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();
// reset password

export const resetPasswordSchema = joi
  .object({
    email: joi.string().email().required(),
    forgetCode: joi.string().length(5).required(),
    password: joi.string().required().pattern(new RegExp(`^.{8,}$`)),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
// Update password
export const updatePasswordSchema = joi
  .object({
    email: joi.string().email().required(),
    oldPassword: joi.string().required(),
    newPassword: joi.string().required().pattern(new RegExp(`^.{8,}$`)),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
  })
  .required();
export const softDeleteUser = joi
  .object({
    userId: joi.string().custom(isValidObjectId),
  })
  .required();
