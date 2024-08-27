
import slugify from 'slugify'
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { reviewModel } from '../../../databases/models/review.model.js';




const createReview = catchAsyncError(async (req, res, next) => {

  req.body.user = req.user._id;
  let isReview = await reviewModel.findOne({ user: req.user._id, product: req.body.product })
  if(isReview) return next(new AppError("already have review", 409))
  let results = new reviewModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "added", added });
});


const getAllReview = catchAsyncError(async (req, res, next) => {
     let apiFeature = new ApiFeatures(reviewModel.find(), req.query).pagination().sort().search().fields();
     let results = await apiFeature.mongooseQuery
  res.json({ message: "Done", results });
});

const getReviewById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await reviewModel.findOne({_id:id});
  res.json({ message: "Done", results });
});

const updateReview = catchAsyncError(async (req, res, next) => {

  let { id } = req.params; 
  let results = await reviewModel.findOneAndUpdate({_id:id , user: req.user._id}, req.body, { new: true });
  !results && next(new AppError("not found Review", 404));
  results && res.json({ message: "Done", results });
});

const deleteReview = deleteOne(reviewModel);
export {
    createReview,
    getAllReview,
    getReviewById,
    updateReview,
    deleteReview


}