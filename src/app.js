import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, "../public/temp");

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// User Routes
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/user", userRoutes);
// Post Routes
import postRoutes from "./routes/post.routes.js";
app.use("/api/v1/post", postRoutes);

// Comment Routes
import commentRoutes from "./routes/comment.routes.js";
app.use("/api/v1/comment", commentRoutes);

// Default Route
app.use("/", (req, res) => {
  res.sendFile(`${parentDir}/down.jpg`);
});
