import Joi from "joi";

export const addReviewSchema = Joi.object({
  doctorId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(5).max(1000).required(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().min(5).max(1000),
});
