import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Create Post
export const createPost = asyncHandler(async (req, res) => {
  const { title, description, categories, username } = req.body;

  const postImageLocalPath = req?.file?.path;
  const postImage = await uploadOnCloudinary(postImageLocalPath);

  const post = await Post.create({
    title,
    description,
    categories,
    username,
    postImage: postImage?.url || "",
  });

  if (!post) {
    throw new ApiError(500, "Something went wrong while creating a post");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, post, "Post Created Successfully"));
});

// Get a post by id
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Post Id is missing");
  }
  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      // Which user has posted
      $lookup: {
        from: "users",
        localField: "username",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      // Which users have commented
      $lookup: {
        from: "comments",
        localField: "_id", // Lookup comments based on post's _id
        foreignField: "commentOnPost",
        as: "comments",
        pipeline : [
          {
            $lookup : {
              from :  "users",
              localField : "commentBy",
              foreignField : "_id",
              as : "commentBy"
            }
          },
          {
            $project : {
              commentText : 1,
              "commentBy.name" : 1
            }
          }
        ]
      },
    }
  ]);
  if (post.length === 0) {
    throw new ApiError(400, "No Post Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, post[0], "Post Fetched Successfully"));
});

// Get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find();
  return res
    .status(200)
    .json(new ApiResponse(200, allPosts, "All Posts fetched Successfully"));
});

// Delete a post
export const deletePostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(400, "No Post Found");
  }
  const isEqual = post?.username.toString() === req?.user?._id.toString();
  if (isEqual === false) {
    throw new ApiError(401, "You cannot delete this post");
  }
  const deletedPost = await Post.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted Successfully"));
});

// Update post image
export const updatePostImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(400, "No Post Found");
  }
  const isEqual = post?.username.toString() === req?.user?._id.toString();
  if (isEqual === false) {
    throw new ApiError(401, "You cannot update this post");
  }
  const postImageLocalPath = req?.file?.path;
  if (!postImageLocalPath) {
    throw new ApiError(400, "Post File is Required");
  }
  const postImage = await uploadOnCloudinary(postImageLocalPath);
  if (!postImage) {
    throw new ApiError(500, "Error while uploading profile image");
  }
  const updatePost = await Post.findByIdAndUpdate(
    id,
    { $set: { postImage: postImage?.url } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatePost, "Post Image changed successfully"));
});

// Update a post
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(400, "No Post Found");
  }
  const isEqual = post?.username.toString() === req?.user?._id.toString();
  if (isEqual === false) {
    throw new ApiError(401, "You cannot update this post");
  }
  const { title, description } = req.body;

  const updateFields = {};

  if (title && title !== post?.title) {
    updateFields.title = title;
  }
  if (description && description !== post?.description) {
    updateFields.description = description;
  }
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    { $set:  updateFields  },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});
