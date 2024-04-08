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
  } catch (err) {
    // throw new ApiError(
    //   400,
    //   "Something went wrong while generating access and refresh token"
    // );
    const error = new ApiError(400 , "Something went wrong while generating access and refresh token")
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
};

// Register
export const signUp = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;
  if ([name, email, username, password].some((field) => field?.trim() === "")) {
    // throw new ApiError(400, "All Fields Are Required");
    const error = new ApiError(400, "All Fields Are Required");
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  if (!name || !email || !username || !password) {
    // throw new ApiError(400, "All Fields Are Required");
    const error = new ApiError(400, "All Fields Are Required");
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    const error = new ApiError(
      400,
      "User with same username or email is already presnet"
    );
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
    // throw new ApiError(
    //   400,
    //   "User with same username or email is already presnet"
    // );
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
    // throw new ApiError(500, "Something went wrong while creating a user");
    const error = new ApiError(
      500,
      "Something went wrong while creating a user"
    );
    return res.status(error?.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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
    // throw new ApiError(404, "User does not exist");
    const error = new ApiError(404, "User does not exist");
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const isPasswordCorrect = await user?.isPasswordSame(password);
  if (!isPasswordCorrect) {
    // throw new ApiError(404, "Credentials are not correct");
    const error = new ApiError(404, "Credentials are not correct");
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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
    // throw new ApiError(400, "All fields are required");
    const error = new ApiError(400 , "All fields are required")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  const user = await User.findById(req.user?._id);

  const isOldPasswordCorrect = await user?.isPasswordSame(oldPassword);
  if (!isOldPasswordCorrect) {
    // throw new ApiError(400, "Invalid Old Password");
    const error = new ApiError(400 , "Invalid Old Password")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  if (newPassword !== confirmPassword) {
    // throw new ApiError(400, "Password does not match");
    const error = new ApiError(400 , "Password does not match")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

// Update User Details
export const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, email, username } = req.body;
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    // throw new ApiError(400, "User with same username or email is present");
    const error = new ApiError(400 , "User with same username or email is present")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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
    // throw new ApiError(400, "profile image file is missing");
    const error = new ApiError(400 , "profile image file is missing")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  const profileImage = await uploadOnCloudinary(profileImageLocalPath);
  if (!profileImage?.url) {
    // throw new ApiError(400, "Error while uploading avatar");
    const error = new ApiError(500 , "Error while uploading avatar")
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errors: error.errors,
    });
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

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    // throw new ApiError(401, "Unauthorized request");
    const error = new ApiError(401, "Unauthorized request");
    return res.status(error?.statusCode).json({
      statusCode: error?.statusCode,
      message: error?.message,
    });
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOEKN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      // throw new ApiError(401, "Invalid Token");
      const error = new ApiError(401, "Invalid Token");
      return res.status(error?.statusCode).json({
        statusCode: error?.statusCode,
        message: error?.message,
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      // throw new ApiError(401, "Refresh Token is expired or used");
      const error = new ApiError(401, "Refresh Token is expired or used");
      return res.status(error?.statusCode).json({
        statusCode: error?.statusCode,
        message: error?.message,
      });
    }

    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      user?._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Delete a User?

// Forgot Password

