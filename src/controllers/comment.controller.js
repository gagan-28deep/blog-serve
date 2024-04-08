import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
  const { commentText, commentOnPost } = req.body;
  if (!commentText) {
    // throw new ApiError(400, "comment text is required");
    const error = new ApiError(400 , "comment text is required")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  const comment = await Comment.create({
    commentText,
    commentBy : new mongoose.Types.ObjectId(req?.user?._id),
    commentOnPost,
  });
  if (!comment) {
    // throw new ApiError(500, "Something went wrong while posting a comment");
    const error = new ApiError(500 , "something went wrong while posting a comment")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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
    // throw new ApiError(400, "No Comment Found");
    const error = new ApiError(400 , "No comment Found")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const isEqual = req?.user?._id?.toString() === comment?.commentBy?.toString();
  console.log(isEqual);
  if (isEqual === false) {
    // throw new ApiError(401, "You cannot update this comment");
    const error = new ApiError(400 , "You cannot update this comment")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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
    // throw new ApiError(400, "No Comment Found");
    const error = new ApiError(400 , "No Comment Dound")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const isEqual = req?.user?._id?.toString() === comment?.commentBy?.toString();
  if (isEqual === false) {
    // throw new ApiError(401, "You cannot delete this comment");
    const error = new ApiError(400 , "Ypu cannot delete this comment")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const deletedComment = await Comment.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully"));
});
