import Joi from "joi";

// **Post Schemas**
export const addPostSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  tag: Joi.string().valid("Question", "Advice", "Healing story"),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(500),
  tag: Joi.string().valid("Question", "Advice", "Healing story"),
});

// **Comment Schemas**
export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500),
});

// **Reply Schemas**
export const createReplySchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});

export const updateReplySchema = Joi.object({
  content: Joi.string().min(1).max(500),
});
