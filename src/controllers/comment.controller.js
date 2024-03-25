import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
  const { commentText, commentBy, commentOnPost } = req.body;
  if (!commentText) {
    throw new ApiError(400, "comment text is required");
  }

  const comment = await Comment.create({
    commentText,
    commentBy,
    commentOnPost,
  });
  if (!comment) {
    throw new ApiError(500, "Something went wrong while posting a comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, comment, "comment posted successfully"));
});

// Update a comment
export const updateCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(400, "No Comment Found");
  }
  const isEqual = req?.user?._id?.toString() === comment?.commentBy?.toString();
  console.log(isEqual);
  if (isEqual === false) {
    throw new ApiError(401, "You cannot update this comment");
  }
  const { commentText } = req.body;
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { $set: { commentText } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated Successfully"));
});

// Delete a comment
export const deleteCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(400, "No Comment Found");
  }
  const isEqual = req?.user?._id?.toString() === comment?.commentBy?.toString();
  if (isEqual === false) {
    throw new ApiError(401, "You cannot delete this comment");
  }
  const deletedComment = await Comment.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully"));
});
