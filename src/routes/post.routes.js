import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createPost,
  deletePostById,
  getAllPosts,
  getPostById,
  updatePost,
  updatePostImage,
} from "../controllers/post.controller.js";
const router = express.Router();

router.route("/getallposts").get(getAllPosts);
router.route("/getpostbyid/:id").get(getPostById);
// Secured Routes
router
  .route("/create-post")
  .post(verifyJwt, upload.single("postImage"), createPost);
router.route("/delete/:id").delete(verifyJwt, deletePostById);
router
  .route("/updatepostimage/:id")
  .patch(verifyJwt, upload.single("postImage"), updatePostImage);
router.route("/updatepost/:id").patch(verifyJwt, updatePost);

export default router;
