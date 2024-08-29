import express from 'express';
import * as categoryController from './categories.controller.js';
import subCategoryRouter from '../subcategories/subCategories.routes.js';
import { validation } from '../../utils/middleware/validation.js';
import { createCategorySchema, getCategoryByIdSchema } from './categories.validator.js';
import { uploadSingleFile } from '../../utils/middleware/fileUploads.js';

const categoryRouter = express.Router();

// Use the subCategoryRouter for subcategories under a specific category
categoryRouter.use('/:id/subCategory', subCategoryRouter);

// Route to handle GET and POST requests for categories
// POST request will handle file upload and category creation
categoryRouter.route("/")
  .get(categoryController.getAllCategories) // Get all categories
  .post(
    uploadSingleFile('category', 'image'), // Middleware to handle file upload
    validation(createCategorySchema), // Middleware to validate request body
    categoryController.createCategory // Controller to create a new category
  );

// Route to handle GET, PUT, and DELETE requests for a specific category by ID
categoryRouter.route("/:id")
  .get(validation(getCategoryByIdSchema), categoryController.getCategoryById) // Get a specific category by ID
  .put(
    uploadSingleFile('category', 'image'), // Middleware to handle file upload (if updating image)
    categoryController.updateCategory // Controller to update a specific category
  )
  .delete(categoryController.deleteCategory); // Controller to delete a specific category

// Route to get all products by category slug
categoryRouter.get('/categories/:slug/products', categoryController.getAllProductsByCategory);

export default categoryRouter;
