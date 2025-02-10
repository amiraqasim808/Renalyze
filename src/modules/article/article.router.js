import { Router } from "express";
import * as articleController from "./article.controller.js";
import * as articleSchema from "./article.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/autherization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

// ✅ Create an Article
router.post(
  "/add",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("img"),
  validation(articleSchema.addArticleSchema),
  articleController.addArticle
);

// ✅ Get All Articles
router.get("/all", articleController.getArticles);

// ✅ Get Article by ID
router.get("/:id", articleController.getArticleById);

// ✅ Update Article
router.patch(
  "/update/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("img"), // To handle image upload for update
  validation(articleSchema.updateArticleSchema),
  articleController.updateArticle
);

// ✅ Delete Article
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("admin"),
  articleController.deleteArticle
);

export default router;
