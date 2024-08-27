import express from 'express';
import * as brandController from './brands.controller.js'
import { validation } from '../../utils/middleware/validation.js';
import { createBrandSchema, updateBrandSchema } from './brand.validation.js';
import { uploadSingleFile } from '../../utils/middleware/fileUploads.js';
const brandRouter = express.Router();


// category/:cartegoryId/subCategory

brandRouter.route("/").get(brandController.getAllBrand).post(
    uploadSingleFile('brand','logo'),
    validation(createBrandSchema), brandController.createBrand);


brandRouter.route("/:id").get(brandController.getBrandById).put(validation(updateBrandSchema), brandController.updateBrand).delete(brandController.deleteBrand);







export default brandRouter;