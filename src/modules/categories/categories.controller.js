import { categoryModel } from "../../../databases/models/category.model.js";
import { productModel } from "../../../databases/models/product.model.js";
import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from "../../utils/handlers/refactor.handler.js";
import ApiFeatures from "../../utils/APIFeatures.js";

const createCategory = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  req.body.image = req.file.filename;

  let results = new categoryModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "added", added });
});

const getAllCategories = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(categoryModel.find(), req.query).sort().search().fields();
  let results = await apiFeature.mongooseQuery;
  res.json({ message: "Done", results });
});

const getCategoryById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await categoryModel.findById(id);
  res.json({ message: "Done", results });
});

const updateCategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { name } = req.body;
  let results = await categoryModel.findByIdAndUpdate(id, { name, slug: slugify(name) }, { new: true });
  !results && next(new AppError("not found category", 404));
  results && res.json({ message: "Done", results });
});

const deleteCategory = deleteOne(categoryModel);

const getAllProductsByCategory = catchAsyncError(async (req, res, next) => {
  let { slug } = req.params;
  let category = await categoryModel.findOne({ slug });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  let apiFeature = new ApiFeatures(productModel.find({ category: category._id }), req.query).sort().search().fields().pagination();
  let products = await apiFeature.mongooseQuery;
  res.json({ message: "Done", products });
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllProductsByCategory
};
