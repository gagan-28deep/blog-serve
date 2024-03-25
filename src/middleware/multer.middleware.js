import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Though original name is not preferred , this is less time operation we will upload on local storage then on cloudinary,
    // But give unique names
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
