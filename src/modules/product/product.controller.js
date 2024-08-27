import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from "../../utils/handlers/refactor.handler.js";
import { productModel } from '../../../databases/models/product.model.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import mongoose from 'mongoose';

// Function to create a product
const createProduct = async (req, res, next) => {
  try {
    // Check if files are present
    if (!req.files || !req.files.imgCover || !req.files.imgCover[0]) {
      return res.status(400).json({ message: "Image cover is required" });
    }
    if (!req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Proceed with creating the product
    req.body.slug = slugify(req.body.title);
    req.body.imgCover = req.files.imgCover[0].filename;
    req.body.images = req.files.images.map(ele => ele.filename);

    let results = new productModel(req.body);
    let added = await results.save();
    res.status(201).json({ message: "added", added });
  } catch (error) {
    next(error);
  }
};

// Function to get all products
const getAllProduct = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query).sort().search().fields();
  let results = await apiFeature.mongooseQuery;
  res.json({ message: "Done", page: apiFeature.page, results });
});

// Function to get a product by ID
const getProductById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  const product = await productModel.findById(id);

  // Check if the product was found
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Return the found product
  res.status(200).json({
    message: "Done",
    results: product,
  });
});

// Function to update a product
const updateProduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { title } = req.body;
  if (req.body.title) {
    req.body.slug = slugify(title);
  }
  let results = await productModel.findByIdAndUpdate(id, { ...req.body }, { new: true });

  if (!results) {
    return next(new AppError("not found Product", 404));
  }

  res.json({ message: "Done", results });
});

// Function to delete a product
const deleteProduct = deleteOne(productModel);

// Function to get products by name
const getProductsByName = catchAsyncError(async (req, res, next) => {
  const { title } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Title parameter is required" });
  }

  // Search for products matching the title
  const results = await productModel.find({ title: new RegExp(title, 'i') });

  // Check if any products were found
  if (results.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  return res.json({ message: "Products found", results });
});


export {
  createProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByName
};
