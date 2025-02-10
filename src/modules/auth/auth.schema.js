import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// Register
export const register = joi
  .object({
    userName: joi.string().required().min(3).max(20).messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must be less than 20 characters",
    }),
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$`
        )
      )
      .messages({
        "string.empty": "Password is required",
        "string.pattern.base":
          "Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one digit, and one special character",
      }),
    confirmPassword: joi
      .string()
      .required()
      .valid(joi.ref("password"))
      .messages({
        "any.only": "Confirm password must match password",
      }),
  })
  .required();

// Activate Account
export const activateAccount = joi
  .object({
    token: joi.string().required().messages({
      "string.empty": "Activation token is required",
    }),
  })
  .required();

// Login
export const login = joi
  .object({
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  })
  .required();

// Forget Code
export const forgetCodeSchema = joi
  .object({
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
  })
  .required();

// Verify Code
export const verifyCodeSchema = joi
  .object({
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    forgetCode: joi.string().length(4).required().messages({
      "string.empty": "Forget code is required",
      "string.length": "Forget code must be 4 characters",
    }),
  })
  .required();

// Reset Password
export const resetPasswordSchema = joi
  .object({
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$`
        )
      )
      .messages({
        "string.empty": "Password is required",
        "string.pattern.base":
          "Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one digit, and one special character",
      }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "any.only": "Confirm password must match password",
      }),
  })
  .required();

// Update Password
export const updatePasswordSchema = joi
  .object({
    email: joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    oldPassword: joi.string().required().messages({
      "string.empty": "Old password is required",
    }),
    newPassword: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$`
        )
      )
      .messages({
        "string.empty": "New password is required",
        "string.pattern.base":
          "New password must be at least 8 characters, include one uppercase letter, one lowercase letter, one digit, and one special character",
      }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Confirm password must match new password",
      }),
  })
  .required();


  