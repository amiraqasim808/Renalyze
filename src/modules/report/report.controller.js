import { Comment } from "../../../DB/models/comment.model.js";
import { Post } from "../../../DB/models/post.model.js";
import { Reply } from "../../../DB/models/reply.model.js";
import { Report } from "../../../DB/models/report.model.js";
import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ✅ Add a Report
export const addReport = asyncHandler(async (req, res, next) => {
  const { reportedItem, itemType, reason, description } = req.body;

  // Ensure valid item type
  const validItemTypes = ["User", "Post", "Comment", "Reply"];
  if (!validItemTypes.includes(itemType)) {
    const error = new Error("Invalid item type");
    error.cause = 400;
    return next(error);
  }

  // Check if the reported item exists based on its type
  let itemExists = false;
  switch (itemType) {
    case "User":
      itemExists = await User.findById(reportedItem);
      break;
    case "Post":
      itemExists = await Post.findById(reportedItem);
      break;
    case "Comment":
      itemExists = await Comment.findById(reportedItem);
      break;
    case "Reply":
      itemExists = await Reply.findById(reportedItem);
      break;
  }

  if (!itemExists) {
    const error = new Error(`${itemType} with the provided ID does not exist`);
    error.cause = 404;
    return next(error);
  }

  // Create report if the item exists
  const report = await Report.create({
    reportedBy: req.user._id,
    reportedItem,
    itemType,
    reason,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Report submitted successfully",
    report,
  });
});

// ✅ Get All Reports (Admin Only)
export const getReports = asyncHandler(async (req, res, next) => {
  const reports = await Report.find()
    .populate("reportedBy", "userName profileImage")
    .populate({
      path: "reportedItem",
      populate: {
        path: "userId",
        select: "userName profileImage",
      },
    });


  res.status(200).json({ success: true, results: reports });
});

// ✅ Get Report by ID
export const getReportById = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate("reportedBy", "userName profileImage")
    .populate({
      path: "reportedItem",
      populate: {
        path: "userId", // assuming the field in Post/Comment/Reply schema is called `user`
        select: "userName profileImage",
      },
    });

  if (!report) {
    const error = new Error("Report not found");
    error.cause = 404;
    return next(error);
  }

  res.status(200).json({ success: true, report });
});


// ✅ Update Report Status (Admin Only)
export const updateReportStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "reviewed", "resolved"].includes(status)) {
    const error = new Error("Invalid status");
    error.cause = 400;
    return next(error);
  }

  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if (!report) {
    const error = new Error("Report not found");
    error.cause = 404;
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: "Report status updated",
    report,
  });
});

// ✅ Delete Report (Admin Only)
export const deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    const error = new Error("Report not found");
    error.cause = 404;
    return next(error);
  }

  res.status(200).json({ success: true, message: "Report deleted" });
});
