import express from 'express';
import * as productController from './product.controller.js';
import { uploadMixFiles } from '../../utils/middleware/fileUploads.js';
import { allowTo, protectRoutes } from '../auth/auth.controller.js';

const productRouter = express.Router();

productRouter
  .route("/")
  .get(productController.getAllProduct)
  .post(
    // protectRoutes,
    // allowTo("user"),
    uploadMixFiles("product", [
      { name: "imgCover", maxCount: 1 },
      { name: "images", maxCount: 8 },
    ]),
    productController.createProduct
  );
productRouter.route('/search/:title').get(productController.getProductsByName);

productRouter.route("/:id")
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

export default productRouter;
