import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import { brandModel } from '../../../databases/models/brand.model.js';
import ApiFeatures from '../../utils/APIFeatures.js';

// Function to extract filename from URL
const getFilenameFromUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return path.basename(parsedUrl.pathname);
  } catch (err) {
    console.error(`Failed to parse URL: ${url}`, err);
    return null;
  }
};

// Function to delete brand image from the filesystem
const deleteBrandImage = (filename) => {
  if (!filename) return;

  const decodedFilename = decodeURIComponent(filename); // Decode URL-encoded characters
  const filePath = path.join('uploads', 'brand', decodedFilename);

  // Log the file path for debugging
  console.log(`Attempting to delete file: ${filePath}`);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete image file: ${filePath}`, err);
    } else {
      console.log(`Successfully deleted image file: ${filePath}`);
    }
  });
};

const createBrand = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  req.body.logo = req.file.filename; // Ensure only filename is saved
  let results = new brandModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "added", added });
});

const getAllBrand = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(brandModel.find(), req.query).sort().search().fields();
  let results = await apiFeature.mongooseQuery;
  res.json({ message: "Done", results });
});

const getBrandById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await brandModel.findById(id);
  res.json({ message: "Done", results });
});

const updateBrand = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  req.body.slug = slugify(req.body.name);
  if (req.file) req.body.logo = req.file.filename; // Ensure only filename is saved
  let results = await brandModel.findByIdAndUpdate(id, req.body, { new: true });
  !results && next(new AppError("not found Brand", 404));
  results && res.json({ message: "Done", results });
});

const deleteBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findById(id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  // Delete the brand record from the database
  await brandModel.findByIdAndDelete(id);

  // Extract the filename from the URL and delete the associated brand image from the filesystem
  if (brand.logo) {
    const filename = getFilenameFromUrl(brand.logo); // Extract filename from URL
    if (filename) {
      deleteBrandImage(filename);
    } else {
      console.error(`Filename extraction failed for URL: ${brand.logo}`);
    }
  }

  res.status(204).json({ message: "Brand deleted successfully" });
});

export {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
  deleteBrand
};
