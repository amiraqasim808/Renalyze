import { Review } from "../../../DB/models/review.model.js";
import { Doctor } from "../../../DB/models/doctor.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const updateDoctorAvgRating = async (doctorId) => {
  const reviews = await Review.find({ doctor: doctorId });

  if (reviews.length === 0) {
    return await Doctor.findByIdAndUpdate(doctorId, { avgRating: 0 });
  }

  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await Doctor.findByIdAndUpdate(doctorId, { avgRating: avgRating.toFixed(1) });
};

// Add Review
export const addReview = asyncHandler(async (req, res, next) => {
  const { doctorId, rating, comment } = req.body;

  // Validate doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.cause = 404;
    return next(error);
  }

  // Check if the user has already reviewed this doctor
  const existingReview = await Review.findOne({
    user: req.user._id,
    doctor: doctorId,
  });
  if (existingReview) {
    const error = new Error("You have already reviewed this doctor");
    error.cause = 400;
    return next(error);
  }

  // Create a new review
  const review = await Review.create({
    user: req.user._id,
    doctor: doctorId,
    rating,
    comment,
  });
  await updateDoctorAvgRating(doctorId);
  res.status(201).json({
    success: true,
    message: "Review added successfully",
    review,
  });
});

// Get Reviews
export const getReviews = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  const filter = doctorId ? { doctor: doctorId } : {};
  const reviews = await Review.find(filter).populate(
    "user",
    "userName profileImage"
  );

  res.status(200).json({ success: true, results: reviews });
});

// Get Review by ID
export const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate("user", "name");

  if (!review) {
    const error = new Error("Review not found");
    error.cause = 404;
    return next(error);
  }

  res.status(200).json({ success: true, review });
});

// Update Review
export const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find the review
  const review = await Review.findById(id);
  if (!review) {
    const error = new Error("Review not found");
    error.cause = 404;
    return next(error);
  }

  // Ensure the user updating the review is the owner
  if (review.user.toString() !== req.user._id.toString()) {
    const error = new Error("Unauthorized to update this review");
    error.cause = 403;
    return next(error);
  }

  const updatedReview = await Review.findByIdAndUpdate(id, updates, {
    new: true,
  });
  await updateDoctorAvgRating(review.doctor);
  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    updatedReview,
  });
});

// Delete Review
export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    const error = new Error("Review not found");
    error.cause = 404;
    return next(error);
  }

  // Ensure the user deleting the review is the owner
  if (review.user.toString() !== req.user._id.toString()) {
    const error = new Error("Unauthorized to delete this review");
    error.cause = 403;
    return next(error);
  }
  await Review.findByIdAndDelete(id);
await updateDoctorAvgRating(review.doctor);
  res.status(200).json({ success: true, message: "Review deleted" });
});
