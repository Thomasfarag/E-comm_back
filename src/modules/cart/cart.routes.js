import express from 'express';
import * as cart from './cart.controller.js'
import { protectRoutes } from '../auth/auth.controller.js';
const cartRouter = express.Router();


// category/:cartegoryId/subCategory

cartRouter.route("/").post(protectRoutes, cart.addToCart).get(protectRoutes,cart.getCart);
cartRouter.route("/:id").delete(protectRoutes,cart.removeCartItem ).get(protectRoutes,cart.getCartById);
cartRouter.route("/").delete(protectRoutes,cart.clearCart );

cartRouter.put("/",protectRoutes,cart.updateCart)
// .get(reviewController.getReviewById).put(protectRoutes, reviewController.updateReview)











export default cartRouter;