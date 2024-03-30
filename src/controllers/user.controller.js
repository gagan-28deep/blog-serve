import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Cookies option
const options = {
  httpOnly: true,
  secure: true,
};

// Generate access and refresh Token
const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user?.generateAccessToken();
    const refreshToken = await user?.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "Something went wrong while generating access and refresh token"
    );
  }
};

// Register
export const signUp = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;
  if ([name, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields Are Required");
  }
  if (!name || !email || !username || !password) {
    throw new ApiError(400, "All Fields Are Required");
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(
      400,
      "User with same username or email is already presnet"
    );
  }
  let profileImageLocalPath;
  if (req.file && req?.file?.path) {
    profileImageLocalPath = req?.file?.path;
  }
  const profileImage = await uploadOnCloudinary(profileImageLocalPath);

  const user = await User.create({
    name,
    email,
    username,
    password,
    profileImage: profileImage?.url || "",
  });
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating a user");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "Successfully created user"));
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: username }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
    // const error = new ApiError(404, "User does not exist");
    // return res.status(error.statusCode).json({
    //   statusCode : error.statusCode,
    //   success: false,
    //   message: error.message,
    //   errors: error.errors,
    // });
  }
  const isPasswordCorrect = await user?.isPasswordSame(password);
  if (!isPasswordCorrect) {
    throw new ApiError(404, "Credentials are not correct");
  }
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user?._id
  );
  user.refreshToken = refreshToken;

  const loggedInUser = {
    ...user.toObject(),
    password: undefined,
    refreshToken: undefined,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findById(req.user?._id);

  const isOldPasswordCorrect = await user?.isPasswordSame(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Password does not match");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, email, username } = req.body;
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "User with same username or email is present");
  }

  const updateFields = {};

  if (name && name !== req.user.name) {
    updateFields.name = name;
  }

  if (email && email !== req.user.email) {
    updateFields.email = email;
  }

  if (username && username !== req.user.username) {
    updateFields.username = username;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

// Upload(change also) Profile image

export const updateUserProfileImage = asyncHandler(async (req, res) => {
  const profileImageLocalPath = req.file?.path;

  if (!profileImageLocalPath) {
    throw new ApiError(400, "profile image file is missing");
  }

  const profileImage = await uploadOnCloudinary(profileImageLocalPath);
  if (!profileImage?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profileImage: profileImage?.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "profile image Updated Successfully"));
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfullt"));
});

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find();
  return res.json(
    new ApiResponse(200, allUsers, "All Users Fetched Successfully")
  );
});


// Generate Refresh Token

// Delete a User?

// Forgot Password

