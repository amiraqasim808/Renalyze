import { Post } from "../../../DB/models/post.model.js";
import { Comment } from "../../../DB/models/comment.model.js";
import { Like } from "../../../DB/models/like.model.js";
import cloudinary from "../../utils/cloud.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Reply } from "../../../DB/models//reply.model.js";

// **Create a new post**
export const addPost = asyncHandler(async (req, res, next) => {
  const { content, tag } = req.body;
  const mediaFiles = req.files; // Handle multiple media files

  let media = [];
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "post_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  const post = await Post.create({
    userId: req.user._id,
    content,
    media,
    tag,
  });

  res
    .status(201)
    .json({ success: true, message: "Post created successfully", post });
});

// **Get all posts**
export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("userId", "userName profileImage") // Get user info
    .populate({
      path: "comments",
      select: "content userId createdAt",
      populate: { path: "userId", select: "userName profileImage" },
    })
    .populate("likes") // Count of likes
    .populate("commentCount"); // Count of comments

  res.status(200).json({ success: true, results: posts });
});

// **Get a specific post by ID**
export const getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("userId", "userName profileImage")
    .populate({
      path: "comments",
      select: "content userId createdAt",
      populate: { path: "userId", select: "userName profileImage" },
    })
    .populate("likes")
    .populate("commentCount");

  if (!post) {
    return next(new Error("Post not found"));
  }

  res.status(200).json({ success: true, post });
});

// **Update a post**
export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content, tag } = req.body;
  const mediaFiles = req.files;

  const post = await Post.findById(id);
  if (!post) {
    return next(new Error("Post not found"));
  }
  if (post.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to update this post!");
    error.cause = 403;
    return next(error);
  }
  const updateData = {};

  // Update content and tag only if provided
  if (content !== undefined) updateData.content = content;
  if (tag !== undefined) updateData.tag = tag;

  // Handle media upload
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      updateData.media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "post_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  // If no media files were uploaded, retain the existing media
  if (!updateData.media) updateData.media = post.media;

  const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    updatedPost,
  });
});

// **Delete a post**
export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    return next(new Error("Post not found"));
  }

  // Find comments related to the post
  const comments = await Comment.find({ postId: id });

  // Extract comment IDs to delete related replies
  const commentIds = comments.map(comment => comment._id);

  // Delete replies associated with comments of the post
  await Reply.deleteMany({ commentId: { $in: commentIds } });

  // Delete comments associated with the post
  await Comment.deleteMany({ postId: id });

  // Delete likes associated with the post
  await Like.deleteMany({ postId: id });

  // Delete the post itself
  await Post.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: "Post deleted" });
});


// **Get all replies for a specific comment**
export const getRepliesByCommentId = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  // Fetch all replies for the given comment ID
  const replies = await Reply.find({ commentId })
    .populate("userId", "userName profileImage")
    .populate({
      path: "commentId",
      select: "content userId createdAt",
      populate: { path: "userId", select: "userName profileImage" },
    });

  if (!replies) {
    return next(new Error("No replies found for this comment"));
  }

  res.status(200).json({ success: true, replies });
});

export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // Assuming userId is part of the JWT payload
  const mediaFiles = req.files; // Handle multiple media files
  let media = [];
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "comment_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  // Create a new comment for the post with media
  const newComment = await Comment.create({
    postId,
    userId,
    content,
    media,
  });

  res.status(201).json({
    success: true,
    message: "Comment created successfully",
    comment: newComment,
  });
});

// **Update a comment**
export const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const mediaFiles = req.files; // Handle multiple media files

  let media = [];
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "comment_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  // Update the comment with new content and media
  const updatedComment = await Comment.findOneAndUpdate({
    _id:commentId,
    userId},
    { content, media },
    { new: true }
  );

  if (!updatedComment) {
    return next(new Error("Comment not found"));
  }

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    updatedComment,
  });
});

// **Delete a comment**
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const deletedComment = await Comment.findOneAndDelete({ _id:commentId, userId });

  if (!deletedComment) {
    return next(new Error("Comment not found"));
  }

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// **Create a reply to a comment**
export const createReply = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId  = req.user._id; // Assuming userId is part of the JWT payload
  const mediaFiles = req.files; // Handle multiple media files

  let media = [];
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "reply_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  // Create a new reply to the comment with media
  const newReply = await Reply.create({
    commentId,
    userId,
    content,
    media,
  });

  res.status(201).json({
    success: true,
    message: "Reply created successfully",
    reply: newReply,
  });
});

// **Update a reply**
export const updateReply = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const mediaFiles = req.files; // Handle multiple media files

  let media = [];
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const uploadedMedia = await cloudinary.uploader.upload(file.path, {
            folder: "reply_media",
          });
          return { url: uploadedMedia.secure_url, id: uploadedMedia.public_id };
        })
      );
    } catch (error) {
      return next(new Error("Media upload failed"));
    }
  }

  // Update the reply with new content and media
  const updatedReply = await Reply.findOneAndUpdate(
   { _id:replyId,
    userId},
    { content, media },
    { new: true }
  );

  if (!updatedReply) {
    return next(new Error("Reply not found"));
  }

  res.status(200).json({
    success: true,
    message: "Reply updated successfully",
    updatedReply,
  });
});

// **Delete a reply**
export const deleteReply = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;
  const userId = req.user._id;
  const deletedReply = await Reply.findOneAndDelete({_id:replyId,userId});

  if (!deletedReply) {
    return next(new Error("Reply not found"));
  }

  res.status(200).json({
    success: true,
    message: "Reply deleted successfully",
  });
});
