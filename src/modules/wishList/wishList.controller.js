import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { userModel } from '../../../databases/models/user.model.js';
import { productModel } from '../../../databases/models/product.model.js';

const addToWishList = catchAsyncError(async (req, res, next) => {
  let { product } = req.body;

  let results = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    {
      $addToSet: { wishList: product },
    },
    { new: true }
  ).populate({
    path: 'wishList',
    populate: [
      { path: 'category', select: 'name' },
      { path: 'brand', select: 'name' }
    ]
  });

  if (!results) return next(new AppError("Wishlist not found", 404));
  res.json({ message: "Done", results });
});

const removeFromWishList = catchAsyncError(async (req, res, next) => {
  let { product } = req.body;

  let results = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    {
      $pull: { wishList: product },
    },
    { new: true }
  ).populate('wishList');
  
  if (!results) return next(new AppError("Wishlist not found", 404));
  res.json({ message: "Done", results });
});
const getAllWishList = catchAsyncError(async (req, res, next) => {
  let results = await userModel.findOne({ _id: req.user._id })
    .populate({
      path: 'wishList',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'brand', select: 'name' }
      ]
    });

  if (!results) return next(new AppError("Wishlist not found", 404));
  res.json({ message: "Done", results: results.wishList });
});


export { addToWishList, removeFromWishList, getAllWishList };
