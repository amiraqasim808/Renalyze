import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as authController from "./auth.controller.js";
import * as authSchema from "./auth.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";

const router = Router();

// register
router.post(
  "/register",
  validation(authSchema.register),
  authController.register
);
// google_signUpLogin
router.post(
  "/google",
  authController.googleSignIn
);
//activate account
router.get(
  "/activate_account/:token",
  validation(authSchema.activateAccount),
  authController.activateAccount
);
//login
router.post("/login", validation(authSchema.login), authController.login);
// send forget code
router.patch(
  "/forget_code",
  validation(authSchema.forgetCodeSchema),
  authController.sendForgetCode
);
// Verify code
router.post(
  "/verify_code",
  validation(authSchema.verifyCodeSchema), // Add schema for verifying the code
  authController.verifyCode
);

// Reset password
router.patch(
  "/reset_password",
  validation(authSchema.resetPasswordSchema),
  authController.resetPassword
);

// Update password
router.patch(
  "/update_password",
  validation(authSchema.updatePasswordSchema),
  authController.updatePassword
);
// Logout
router.post("/logout", isAuthenticated, authController.logout);
// Soft delete user
router.delete(
  "/delete",
  isAuthenticated,
  isAuthorized("user"),
  authController.deleteUser
);




export default router;
