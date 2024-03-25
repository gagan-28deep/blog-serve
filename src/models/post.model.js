import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    postImage: {
      type: String,
    },
    categories: {
      type: String,
    },
    // Owner
    username: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // comments
    commentsOnPost: {
      type: [mongoose.Schema.Types.ObjectId], // Array of comment ObjectIds
      ref: 'Comment'
    }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
