import express from "express"
import { verifyJwt } from "../middleware/auth.middleware.js"
import { createComment, deleteCommentById, updateCommentById } from "../controllers/comment.controller.js"
const router = express.Router()

router.use(verifyJwt)

router.route("/createcomment").post(createComment)
router.route("/updatecomment/:id").patch(updateCommentById)
router.route("/deletecomment/:id").delete(deleteCommentById)

export default router