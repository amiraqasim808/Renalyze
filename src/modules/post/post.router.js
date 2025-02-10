import { Router } from "express";
import * as postController from "./post.controller.js";
import * as postSchema from "./post.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

// ✅ Create a Post
router.post(
  "/add",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 5), // Upload up to 5 images/videos
  validation(postSchema.addPostSchema),
  postController.addPost
);

// ✅ Get All Posts
router.get("/all", isAuthenticated, postController.getPosts);

// ✅ Get Post by ID
router.get("/:id", isAuthenticated, postController.getPostById);

// ✅ Update Post
router.patch(
  "/update/:id",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 5), // Upload up to 5 images/videos
  validation(postSchema.updatePostSchema),
  postController.updatePost
);

// ✅ Delete Post
router.delete("/delete/:id", isAuthenticated, postController.deletePost);

// ✅ Create a Comment for a Post
router.post(
  "/:postId/comment",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 3), // Upload up to 3 media files for comment
  validation(postSchema.createCommentSchema),
  postController.createComment
);

// ✅ Update a Comment
router.patch(
  "/comment/:commentId/update",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 3), // Upload up to 3 media files for comment update
  validation(postSchema.updateCommentSchema),
  postController.updateComment
);

// ✅ Delete a Comment
router.delete(
  "/comment/:commentId",
  isAuthenticated,
  postController.deleteComment
);

// ✅ Get all replies for a specific comment
router.get(
  "/comment/:commentId/replies",
  isAuthenticated,
  postController.getRepliesByCommentId
);

// ✅ Create a Reply to a Comment
router.post(
  "/comment/:commentId/reply",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 3), // Upload up to 3 media files for reply
  validation(postSchema.createReplySchema),
  postController.createReply
);

// ✅ Update a Reply
router.patch(
  "/reply/:replyId/update",
  isAuthenticated,
  fileUpload(filterObject.image).array("media", 3), // Upload up to 3 media files for reply update
  validation(postSchema.updateReplySchema),
  postController.updateReply
);

// ✅ Delete a Reply
router.delete("/reply/:replyId", isAuthenticated, postController.deleteReply);

// ✅ Toggle like
router.post(
  "/toggleLike/:targetId",
  isAuthenticated,
  validation(postSchema.toggleLikeSchema),
  postController.toggleLike
);
export default router;
