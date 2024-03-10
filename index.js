import dotenv from "dotenv";
import { app } from "./src/app.js";
import connectDb from "./src/db/index.js";

dotenv.config({
  path: "./.env",
});

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to DB");
  });
