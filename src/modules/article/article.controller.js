import { Article } from "../../../DB/models/article.model.js";
import { User } from "../../../DB/models/user.model.js";
import cloudinary from "../../utils/cloud.js";
import {asyncHandler} from "../../utils/asyncHandler.js";

export const addArticle = asyncHandler(async (req, res, next) => {
  const { title, content } = req.body;
  const image = req.file; // Get the image from the request

  // If image is provided, upload to Cloudinary
  let uploadedImage = null;
  if (image) {
    try {
      uploadedImage = await cloudinary.uploader.upload(image.path, {
        folder: "article_images", // Folder name on Cloudinary
      });
    } catch (error) {
      const cloudinaryError = new Error("Image upload failed");
      cloudinaryError.cause = 500;
      return next(cloudinaryError);
    }
  }

  // If no image is uploaded, use a default image
  const imageUrl = uploadedImage
    ? uploadedImage.secure_url
    : "https://res.cloudinary.com/dwsiotrat/image/upload/v1705480608/default-article.jpg";
  const imageId = uploadedImage
    ? uploadedImage.public_id
    : "defaults/default-article";

  // Find the user who is adding the article
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  // Set the doctor's status based on the user role
  const status = user.role === "admin" ? "published" : "pending";

  // Create a new article
  const article = await Article.create({
    title,
    content,
    image: {
      url: imageUrl,
      id: imageId,
    },
    status,
    author: req.user._id,
  });

  // Return success response
  return res.status(201).json({
    success: true,
    message: "Article added successfully",
    article,
  });
});


export const getArticles = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {}; // If no status is provided, fetch all articles
  const articles = await Article.find(filter);

  res.status(200).json({ success: true, results: articles });
});

export const getArticleById = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    const error = new Error("Article not found");
    error.cause = 404;
    return next(error);
  }

  res.status(200).json({ success: true, article });
});


export const updateArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const image = req.file; // Get the image from the request

  // Find the article
  const article = await Article.findById(id);
  if (!article) {
    const error = new Error("Article not found");
    error.cause = 404;
    return next(error);
  }

  // Allow updates only if the user is the author or an admin
  if (
    req.user.role !== "admin" &&
    article.author.toString() !== req.user._id.toString()
  ) {
    const error = new Error(
      "Unauthorized: You can only update your own article."
    );
    error.cause = 403;
    return next(error);
  }

  let updatedImage = null;
  if (image) {
    try {
      // If a new image is uploaded, upload it to Cloudinary
      updatedImage = await cloudinary.uploader.upload(image.path, {
        folder: "article_images",
      });
    } catch (error) {
      const cloudinaryError = new Error("Image upload failed");
      cloudinaryError.cause = 500;
      return next(cloudinaryError);
    }
  }

  // If no new image is uploaded, keep the existing one
  const imageUrl = updatedImage ? updatedImage.secure_url : article.image.url;
  const imageId = updatedImage ? updatedImage.public_id : article.image.id;

  // Update the article, including the image if updated
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { ...updates, image: { url: imageUrl, id: imageId } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Article updated successfully",
    updatedArticle,
  });
});

export const deleteArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    const error = new Error("Article not found");
    error.cause = 404;
    return next(error);
  }

  // Allow action only if the user is the author or an admin
  if (
    req.user.role !== "admin" &&
    article.author.toString() !== req.user._id.toString()
  ) {
    const error = new Error(
      "Unauthorized: You can only delete your own article."
    );
    error.cause = 403;
    return next(error);
  }

  await Article.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: "Article deleted" });
});

export const updateArticleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { action } = req.body; // "publish" or "archive"

  const status = action === "publish" ? "published" : "archived";

  const article = await Article.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!article) {
    const error = new Error("Article not found");
    error.cause = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: `Article ${status}`,
    article,
  });
});
