import express from 'express';
import * as reviewController from './review.controller.js'
import { protectRoutes } from '../auth/auth.controller.js';
const reviewRouter = express.Router();



reviewRouter.route("/").get(reviewController.getAllReview).post( protectRoutes, reviewController.createReview);


reviewRouter.route("/:id").get( reviewController.getReviewById).put(protectRoutes,reviewController.updateReview).delete(reviewController.deleteReview);









export default reviewRouter;