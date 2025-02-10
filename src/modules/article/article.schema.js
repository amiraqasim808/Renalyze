import Joi from "joi";

export const addArticleSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).max(5000).required(),
});


export const updateArticleSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  content: Joi.string().min(10).max(5000),
});


