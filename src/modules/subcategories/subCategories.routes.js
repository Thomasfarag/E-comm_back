import express from "express";
import * as subCategoryController from "./subCategories.controller.js";
const subCategoryRouter = express.Router({mergeParams: true});

subCategoryRouter.route("/")
    .get(subCategoryController.getAllSubCategories)
    .post(subCategoryController.createSubCategory);

subCategoryRouter.route("/:id")
    .get(subCategoryController.getSubCategoryById)
    .put(subCategoryController.updateSubCategory)
    .delete(subCategoryController.deleteSubCategory);

export default subCategoryRouter;



// http://localhost:3000/api/v1/category .... categories routes

// http://localhost:3000/api/v1/category/6431bf25fdca014a813d95b5/subCategory/ ===> subcategory



