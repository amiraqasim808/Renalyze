import { Router } from "express";
import * as reviewController from "./review.controller.js";
import * as reviewSchema from "./review.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

// ✅ Add a Review
router.post(
  "/add",
  isAuthenticated,
  validation(reviewSchema.addReviewSchema),
  reviewController.addReview
);

// ✅ Get All Reviews
router.get("/all", reviewController.getReviews);

// ✅ Get Review by ID
router.get("/:id", reviewController.getReviewById);

// ✅ Update Review
router.patch(
  "/update/:id",
  isAuthenticated,
  validation(reviewSchema.updateReviewSchema),
  reviewController.updateReview
);

// ✅ Delete Review
router.delete("/delete/:id", isAuthenticated, reviewController.deleteReview);

export default router;

