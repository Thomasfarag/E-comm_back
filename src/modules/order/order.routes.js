import express from 'express';
import * as order from './order.controller.js'
import { protectRoutes } from '../auth/auth.controller.js';
const orderRoute = express.Router();


// category/:cartegoryId/subCategory

// orderRoute.route("/:id").post(protectRoutes, order.createCacheOrder)
orderRoute.route("/checkout/:id").post(protectRoutes, order.createCacheOrder);
// orderRoute.route("/").get(protectRoutes, order.getOrder);
orderRoute.route("/").get(protectRoutes, order.getAllOrders);
    // .get(protectRoutes, order.getCart);
orderRoute.route("/:id").delete(protectRoutes,order.deleteOrder );

// cartRouter.put("/:code",protectRoutes,cart.applyCoupon)
// .get(reviewController.getReviewById).put(protectRoutes, reviewController.updateReview)













export default orderRoute;