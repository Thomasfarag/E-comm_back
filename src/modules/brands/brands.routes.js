import express from 'express';
import * as brandController from './brands.controller.js';
import { validation } from '../../utils/middleware/validation.js';
import { createBrandSchema, updateBrandSchema } from './brand.validation.js';
import { uploadSingleFile } from '../../utils/middleware/fileUploads.js';

const brandRouter = express.Router();

// Route to handle GET and POST requests for brands
// POST request will handle file upload and brand creation
brandRouter.route("/")
  .get(brandController.getAllBrand) // Get all brands
  .post(
    uploadSingleFile('brand', 'logo'), // Middleware to handle file upload
    validation(createBrandSchema), // Middleware to validate request body
    brandController.createBrand // Controller to create a new brand
  );

// Route to handle GET, PUT, and DELETE requests for a specific brand by ID
brandRouter.route("/:id")
  .get(brandController.getBrandById) // Get a specific brand by ID
  .put(
    uploadSingleFile('brand', 'logo'), // Middleware to handle file upload (if updating logo)
    validation(updateBrandSchema), // Middleware to validate request body for update
    brandController.updateBrand // Controller to update a specific brand
  )
  .delete(brandController.deleteBrand); // Controller to delete a specific brand

export default brandRouter;
