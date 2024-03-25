import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, '../../');

import dotenv from "dotenv";
dotenv.config({
  path : (process.cwd() , ".env")
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // else upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File successfully uploaded
    // console.log("File successfully uploaded on cloudinary", response.url);
    fs.unlinkSync(`${parentDir}/${localFilePath}`);
    return response;
  } catch (error) {
    fs.unlinkSync(`${parentDir}/${localFilePath}`);
    // Remove the locally saved file , as the operation on cloudinary upload failed
    return null;
  }
};

export { uploadOnCloudinary  };
