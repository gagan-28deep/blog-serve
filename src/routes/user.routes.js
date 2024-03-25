import express from "express";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  resetPassword,
  signUp,
  updateUserDetails,
  updateUserProfileImage,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.route("/signup").post(upload.single("profileImage"), signUp);
router.route("/login").post(login);
router.route("/getallUsers").get(getAllUsers)

// Secured routes
router.route("/logout").post(verifyJwt, logout);
router.route("/reset-password").post(verifyJwt, resetPassword);
router.route("/updateUser-details").patch(verifyJwt, updateUserDetails);
router
  .route("/profileImage")
  .patch(verifyJwt, upload.single("profileImage"), updateUserProfileImage);
router.route("/getcurrentuser").get(verifyJwt, getCurrentUser);
export default router;
