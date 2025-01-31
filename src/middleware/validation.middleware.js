import { Types } from "mongoose";

export const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map((errObj) => {
        return errObj.message;
      });
      const error = new Error(errorMessages);
      error.cause = 400; 
      return next(error);
    }
    return next();
  };
};

export const isValidObjectId = (value, helper) =>
  Types.ObjectId.isValid(value) ? true : helper.message("invalid object id");
