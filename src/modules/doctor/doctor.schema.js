import Joi from "joi";

export const addDoctorSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required(), 
  address: Joi.string().min(10).max(255).required(),
  aboutDoctor: Joi.string().min(10).max(1000).required(),
  mapLocation: Joi.string().min(10).max(255).required(),
});


export const updateDoctorSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  phone: Joi.string().pattern(/^[0-9]{11}$/),
  address: Joi.string().min(10).max(255),
  aboutDoctor: Joi.string().min(10).max(1000),
  mapLocation: Joi.string().min(10).max(255),
});


 export const updateDoctorStatusSchema = Joi.object({
   action: Joi.string().valid("approve", "reject").required(),
 });
