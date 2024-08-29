import fs from 'fs';
import path from 'path';
import { categoryModel } from "../../../databases/models/category.model.js";
import { productModel } from "../../../databases/models/product.model.js";
import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from "../../utils/handlers/refactor.handler.js";
import ApiFeatures from "../../utils/APIFeatures.js";

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

// Function to delete category image from the filesystem
const deleteCategoryImage = (filename) => {
  if (!filename) return;

  const decodedFilename = decodeURIComponent(filename); // Decode URL-encoded characters
  const filePath = path.join('uploads', 'category', decodedFilename);

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

const createCategory = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  req.body.image = req.file ? req.file.filename : ''; // Handle missing file case

  let results = new categoryModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "Category created", added });
});

const getAllCategories = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(categoryModel.find(), req.query).sort().search().fields();
  let results = await apiFeature.mongooseQuery;
  res.json({ message: "Categories fetched", results });
});

const getCategoryById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await categoryModel.findById(id);
  if (!results) return next(new AppError("Category not found", 404));
  res.json({ message: "Category fetched", results });
});

const updateCategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { name } = req.body;
  let updateData = { name, slug: slugify(name) };
  
  if (req.file) updateData.image = req.file.filename; // Handle image update
  
  let results = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
  if (!results) return next(new AppError("Category not found", 404));
  res.json({ message: "Category updated", results });
});

const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category) return next(new AppError("Category not found", 404));

  // Delete the category record from the database
  await categoryModel.findByIdAndDelete(id);

  // Delete the associated category image from the filesystem
  if (category.image) {
    const filename = getFilenameFromUrl(category.image); // Extract filename from URL
    if (filename) {
      deleteCategoryImage(filename);
    } else {
      console.error(`Filename extraction failed for URL: ${category.image}`);
    }
  }

  res.status(204).json({ message: "Category deleted successfully" });
});

const getAllProductsByCategory = catchAsyncError(async (req, res, next) => {
  let { slug } = req.params;
  let category = await categoryModel.findOne({ slug });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  let apiFeature = new ApiFeatures(productModel.find({ category: category._id }), req.query).sort().search().fields().pagination();
  let products = await apiFeature.mongooseQuery;
  res.json({ message: "Products fetched", products });
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllProductsByCategory
};
