
import multer from "multer";
import AppError from "../services/AppError.js";


let options = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${folderName}`);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("invalid image", 400), false);
    }
  }

  return multer({ storage, fileFilter });

};

export const uploadSingleFile = (folderName, fieldName) =>  options(folderName).single(fieldName);




export const uploadMixFiles = (folderName, arrayFields) =>  options(folderName).fields(arrayFields);