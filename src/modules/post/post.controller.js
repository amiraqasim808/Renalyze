import { Post } from "../../../DB/models/post.model.js";
import { Comment } from "../../../DB/models/comment.model.js";
import { Like } from "../../../DB/models/like.model.js";
import cloudinary from "../../utils/cloud.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Reply } from "../../../DB/models//reply.model.js";
import mongoose from "mongoose";

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
  const userId = req.user._id; // Logged-in user

  const posts = await Post.find()
    .populate("userId", "userName profileImage") // Get user info
    .populate({
      path: "comments",
      select: "content userId createdAt likesCount repliesCount", // Select required fields
      populate: [
        { path: "userId", select: "userName profileImage" }, // Populate user info for comments
        { path: "likesCount" }, // Populate like count for each comment
        { path: "repliesCount" }, // Populate replies count for each comment
        {
          path: "likes",
          select: "userId",
          populate: { path: "userId", select: "userName profileImage" }, // Populate likes for each comment
        },
      ],
    })
    .populate({
      path: "likes",
      select: "userId",
      populate: { path: "userId", select: "userName profileImage" },
    })
    .populate("likesCount") // Fetch like count for the post
    .populate("commentCount") // Fetch comment count for the post
    .lean(); // Convert to plain objects to modify data

  // Fetch likes for the logged-in user
  const userLikes = await Like.find({ userId });

  // Add `isLiked` info for posts and comments
  const postsWithLikes = posts.map((post) => {
    const postIsLiked = userLikes.some(
      (like) => like.targetId.equals(post._id) && like.targetType === "Post"
    );

    const commentsWithLikes = post.comments.map((comment) => {
      const commentIsLiked = userLikes.some(
        (like) =>
          like.targetId.equals(comment._id) && like.targetType === "Comment"
      );
      return { ...comment, isLiked: commentIsLiked };
    });

    return { ...post, isLiked: postIsLiked, comments: commentsWithLikes };
  });

  res.status(200).json({ success: true, results: postsWithLikes });
});

// **Get a specific post by ID**
export const getPostById = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Logged-in user

  // Find post by ID and populate necessary fields
  const post = await Post.findById(req.params.id)
    .populate("userId", "userName profileImage") // Get user info
    .populate({
      path: "comments",
      select: "content userId createdAt likesCount repliesCount", // Select required fields
      populate: [
        { path: "userId", select: "userName profileImage" }, // Populate user info for comments
        { path: "likesCount" }, // Populate like count for each comment
        { path: "repliesCount" }, // Populate replies count for each comment
        {
          path: "likes",
          select: "userId",
          populate: { path: "userId", select: "userName profileImage" }, // Populate likes for each comment
        },
      ],
    })
    .populate({
      path: "likes",
      select: "userId",
      populate: { path: "userId", select: "userName profileImage" }, // Populate likes for the post
    })
    .populate("likesCount") // Fetch like count for the post
    .populate("commentCount") // Fetch comment count for the post
    .lean(); // Convert to plain objects to modify data

  // If post not found
  if (!post) {
    const error = new Error("Post not found");
    error.cause = 404;
    return next(error);
  }

  // Fetch likes for the logged-in user
  const userLikes = await Like.find({ userId });

  // Add `isLiked` info for the post
  post.isLiked = userLikes.some(
    (like) => like.targetId.equals(post._id) && like.targetType === "Post"
  );

  // Add `isLiked` info for each comment
  post.comments = post.comments.map((comment) => {
    const commentIsLiked = userLikes.some(
      (like) =>
        like.targetId.equals(comment._id) && like.targetType === "Comment"
    );
    return { ...comment, isLiked: commentIsLiked };
  });

  res.status(200).json({ success: true, post });
});

// **Update a post**
export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content, tag } = req.body;
  const mediaFiles = req.files;

  const post = await Post.findById(id);
  if (!post) {
    const error = new Error("Post not found");
    error.cause = 404;
    return next(error);
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
    const error = new Error("Post not found");
    error.cause = 404;
    return next(error);
  }
  if (post.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to delete this post!");
    error.cause = 403;
    return next(error);
  }
  // Find comments related to the post
  const comments = await Comment.find({ postId: id });

  // Extract comment IDs to delete related replies
  const commentIds = comments.map((comment) => comment._id);

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
  const userId = req.user._id;

  // Fetch replies for the specific comment and populate necessary fields
  const replies = await Reply.find({ commentId })
    .populate("userId", "userName profileImage") // Populate user info for replies
    .populate("likesCount") // Populate like count for replies
    .populate({
      path: "likes",
      select: "userId",
      populate: { path: "userId", select: "userName profileImage" },
    })
    .lean(); // Convert to plain objects to modify data

  if (!replies || replies.length === 0) {
    const error = new Error("No replies found for this comment");
    error.cause = 404;
    return next(error);
  }

  // Fetch likes for the logged-in user
  const userLikes = await Like.find({ userId });

  // Add `isLiked` info for each reply
  const repliesWithLikes = replies.map((reply) => {
    const replyIsLiked = userLikes.some(
      (like) => like.targetId.equals(reply._id) && like.targetType === "Reply"
    );

    return {
      ...reply,
      isLiked: replyIsLiked,
    };
  });

  res.status(200).json({ success: true, replies: repliesWithLikes });
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

  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error("Comment not found");
    error.cause = 404;
    return next(error);
  }
  if (comment.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to update this comment!");
    error.cause = 403;
    return next(error);
  }
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

  if (content && content.trim() !== "") {
    comment.content = content;
  }
  if (media && media.length > 0) {
    comment.media = media;
  }

  await comment.save();

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    comment,
  });
});

// **Delete a comment**
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error("Comment not found");
    error.cause = 404;
    return next(error);
  }
  if (comment.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to delete this comment!");
    error.cause = 403;
    return next(error);
  }
  // Find and delete the comment along with its associated likes and replies
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    userId,
  });

  // Delete associated likes for the comment
  await Like.deleteMany({ targetId: commentId, targetType: "Comment" });

  // Delete associated replies for the comment
  await Reply.deleteMany({ commentId });

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// **Create a reply to a comment**
export const createReply = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // Assuming userId is part of the JWT payload
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
  const mediaFiles = req.files; // Handle multiple media files
  const reply = await Reply.findById(replyId);
  if (!reply) {
    const error = new Error("reply not found");
    error.cause = 404;
    return next(error);
  }
  if (reply.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to update this reply!");
    error.cause = 403;
    return next(error);
  }
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

  if (content && content.trim() !== "") {
    reply.content = content;
  }
  if (media && media.length > 0) {
    reply.media = media;
  }

  await reply.save();

  res.status(200).json({
    success: true,
    message: "Reply updated successfully",
    reply,
  });
});

// **Delete a reply**
export const deleteReply = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;
  const userId = req.user._id;

  const reply = await Reply.findById(replyId);
  if (!reply) {
    const error = new Error("reply not found");
    error.cause = 404;
    return next(error);
  }
  if (reply.userId.toString() !== req.user._id.toString()) {
    const error = new Error("You are not allowed to update this reply!");
    error.cause = 403;
    return next(error);
  }
  // Find and delete the reply
  await Reply.findOneAndDelete({ _id: replyId, userId });

  // Delete associated likes for the reply
  await Like.deleteMany({ targetId: replyId, targetType: "Reply" });

  res.status(200).json({
    success: true,
    message: "Reply deleted successfully",
  });
});

// **Toggle Like**
export const toggleLike = asyncHandler(async (req, res, next) => {
  const { targetId } = req.params; // Can be a post, comment, or reply ID
  const { targetType } = req.body; // Type of entity being liked
  const userId = req.user._id;

  // Validate targetType
  const validTypes = {
    Post,
    Comment,
    Reply,
  };

  if (!validTypes[targetType]) {
    return res.status(400).json({
      success: false,
      message: "Invalid target type",
    });
  }

  // Ensure targetId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid target ID format",
    });
  }

  // Check if the target entity exists
  const targetExists = await validTypes[targetType].findById(targetId);
  if (!targetExists) {
    return res.status(404).json({
      success: false,
      message: `${targetType} not found`,
    });
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({ targetId, targetType, userId });

  if (existingLike) {
    // Unlike (remove the like)
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      success: true,
      message: "Like removed",
    });
  } else {
    // Like (add a new like)
    const newLike = await Like.create({ targetId, targetType, userId });
    return res.status(201).json({
      success: true,
      message: "Like added",
      like: newLike,
    });
  }
});
