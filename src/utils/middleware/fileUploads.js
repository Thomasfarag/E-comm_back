import multer from 'multer';
import AppError from "../services/AppError.js";

// Options function to configure multer storage and file filtering
const options = (folderName) => {
  const storage = multer.diskStorage({
    // Set the destination folder for the uploaded files
    destination: function (req, file, cb) {
      cb(null, `uploads/${folderName}`);
    },
    // Set the filename format for the uploaded files
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  
  // File filter to allow only images
  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid image", 400), false);
    }
  }

  // Return the configured multer instance
  return multer({ storage, fileFilter });
};

// Function to upload a single file
export const uploadSingleFile = (folderName, fieldName) => options(folderName).single(fieldName);

// Function to upload multiple files with different field names
export const uploadMixFiles = (folderName, arrayFields) => options(folderName).fields(arrayFields);
