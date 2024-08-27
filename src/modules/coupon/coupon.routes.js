import express from 'express';
import * as couponController from './coupon.controller.js'
import { protectRoutes } from '../auth/auth.controller.js';
const couponRouter = express.Router();


// category/:cartegoryId/subCategory

couponRouter.route("/").get(couponController.getAllCoupons).post(protectRoutes, couponController.createCoupon);


couponRouter.route("/:id").get( couponController.getCouponById).put(protectRoutes,couponController.updateCoupon).delete(couponController.deleteCoupon);











export default couponRouter;