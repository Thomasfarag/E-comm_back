
import slugify from "slugify";
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import { subCategoryModel } from '../../../databases/models/subcategory.model.js';
import deleteOne from "../../utils/handlers/refactor.handler.js";
import ApiFeatures from "../../utils/APIFeatures.js";

const createSubCategory = catchAsyncError(async (req, res, next) => {
  let { name,categoryId } = req.body;
  let results = new subCategoryModel({ name, slug: slugify(name), category: categoryId });
  let added = await results.save();
  res.status(201).json({ message: "added", added });
});

const getAllSubCategories = catchAsyncError(async (req, res, next) => {
    let filters = {}
    if (req.params && req.params.id) {
        filters = {
          category: req.params.id,
        };
    }
       let apiFeature = new ApiFeatures(subCategoryModel.find(), req.query).pagination().sort().search().fields();
       let results = await apiFeature.mongooseQuery;
  res.json({ message: "Done", results });
});

const getSubCategoryById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await subCategoryModel.findById(id);
  res.json({ message: "Done", results });
});

const updateSubCategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { name,categoryId } = req.body;
  let results = await subCategoryModel.findByIdAndUpdate(id, { name, slug: slugify(name),category:categoryId }, { new: true });
  !results && next(new AppError("not found Subcategory", 404));
  results && res.json({ message: "Done", results });
});

const deleteSubCategory = deleteOne(subCategoryModel);

export { createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory };



    
    // all product on brand

    // parent brand
    // child product





// http://localhost:3000/api/v1/category/6431bf25fdca014a813d95b5/subCategory




// http://localhost:3000/api/v1/subCategory


// brand 
// refector 
// products crud 



// feature ... pagination ...sort ... search ... 