import express from 'express';
import { protectRoutes } from '../auth/auth.controller.js';
const wishListRouter = express.Router();

import * as wishList from './wishList.controller.js'



wishListRouter.patch("/", protectRoutes, wishList.addToWishList);
wishListRouter.get("/", protectRoutes, wishList.getAllWishList);

wishListRouter.delete("/", protectRoutes, wishList.removeFromWishList);
















export default wishListRouter;