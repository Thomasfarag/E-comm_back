
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { couponModel } from '../../../databases/models/coupon.model.js';
import QRCode from 'qrcode'



const createCoupon =
  
  async (req, res, next) => {

  let results = new couponModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "added", added });
  }

  // );


const getAllCoupons = catchAsyncError(async (req, res, next) => {
     let apiFeature = new ApiFeatures(couponModel.find(), req.query).sort().search().fields();
     let results = await apiFeature.mongooseQuery
  res.json({ message: "Done", results });
});

const getCouponById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await couponModel.findOne({ _id: id });
 let url = await QRCode.toDataURL(results.code);
  res.json({ message: "Done", results, url });
});

const updateCoupon = catchAsyncError(async (req, res, next) => {

  let { id } = req.params; // id review 
  // user .... req.user._id
  let results = await couponModel.findOneAndUpdate({_id:id }, req.body, { new: true });
  !results && next(new AppError("not found Review", 404));
  results && res.json({ message: "Done", results });
});

const deleteCoupon = deleteOne(couponModel);


export { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon };