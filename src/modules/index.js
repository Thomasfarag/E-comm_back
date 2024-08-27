import express from 'express';
import globalError from "../utils/middleware/globalErrorHandle.js";
import AppError from "../utils/services/AppError.js";
import authRouter from "./auth/auth.routes.js";
import brandRouter from "./brands/brands.routes.js";
import cartRouter from "./cart/cart.routes.js";
import categoryRouter from "./categories/categories.routes.js";
import couponRouter from "./coupon/coupon.routes.js";
import orderRoute from "./order/order.routes.js";
import productRouter from "./product/product.routes.js";
import reviewRouter from "./review/review.routes.js";
import subCategoryRouter from "./subcategories/subCategories.routes.js";
import userRouter from "./user/user.routes.js";
import wishListRouter from "./wishList/wishList.routes.js";

export function init(app) {
  app.use(express.json()); // Add this line to parse incoming JSON requests
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/subCategory", subCategoryRouter);
  app.use("/api/v1/brand", brandRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/review", reviewRouter);
  app.use("/api/v1/wishList", wishListRouter);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/order", orderRoute);

  app.all("*", (req, res, next) => next(new AppError(`can't find this route: ${req.originalUrl}`, 404)));
  app.use(globalError);
}
