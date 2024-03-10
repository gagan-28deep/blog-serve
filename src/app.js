import express from "express";
import { fileURLToPath } from "url";
import path from "path";

export const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, "../public/temp");
console.log(parentDir);

app.use(express.static("public"));


// Default Route
app.use("/", (req, res) => {
  res.sendFile(`${parentDir}/down.jpg`);
});
