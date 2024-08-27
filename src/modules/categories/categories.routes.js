import express from 'express';
import * as categoryController from './categories.controller.js'
import subCategoryRouter from '../subcategories/subCategories.routes.js';
import { validation } from '../../utils/middleware/validation.js';
import { createCategorySchema, getCategoryByIdSchema } from './categories.validator.js';
const categoryRouter = express.Router();
import { uploadSingleFile } from '../../utils/middleware/fileUploads.js';

categoryRouter.use('/:id/subCategory', subCategoryRouter)





categoryRouter.route("/").get(categoryController.getAllCategories)
  .post(uploadSingleFile('category', 'image'), validation(createCategorySchema), categoryController.createCategory);


categoryRouter
  .route("/:id")
  .get(validation(getCategoryByIdSchema), categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory)


categoryRouter
 .get('/categories/:slug/products', categoryController.getAllProductsByCategory);










export default categoryRouter;