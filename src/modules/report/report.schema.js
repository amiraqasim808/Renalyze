import Joi from "joi";

// Schema for adding a report
export const addReportSchema = Joi.object({
  reportedItem: Joi.string().required(), // ID of the item being reported
  itemType: Joi.string().valid("User", "Post", "Comment", "Reply").required(), // Type of the reported item
  reason: Joi.string().min(3).max(100).required(), // Reason for the report
  description: Joi.string().min(10).max(1000).required(), // Detailed description of the issue
});

// Schema for updating a report's status
export const updateReportStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "reviewed", "resolved").required(), // Valid report statuses
});
