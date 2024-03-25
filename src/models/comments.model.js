import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    commentText: {
      type: String,
      required: [true, "comment text is required"],
    },
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commentOnPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
