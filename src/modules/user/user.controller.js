import slugify from 'slugify'
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import deleteOne from '../../utils/handlers/refactor.handler.js';
import ApiFeatures from '../../utils/APIFeatures.js';
import { userModel } from '../../../databases/models/user.model.js';

const createUser = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if(user) return next(new AppError("duplicate email", 409));
  let results = new userModel(req.body);
  let added = await results.save();
  res.status(201).json({ message: "added", added });
});

const getAllUser = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(userModel.find(), req.query).sort().search().fields();
  let results = await apiFeature.mongooseQuery;
  res.json({ message: "Done", results });
});

const getUserById = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await userModel.findById(id);
  res.json({ message: "Done", results });
});

const updateUser = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  req.body.slug = slugify(req.body.name);
  if (req.file) req.body.logo = req.file.filename;
  let results = await userModel.findByIdAndUpdate(id, req.body, { new: true });
  !results && next(new AppError("not found User", 404));
  results && res.json({ message: "Done", results });
});

const deleteUser = deleteOne(userModel);

const changePassword = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  req.body.changePasswordAt = Date.now();
  let results = await userModel.findOneAndUpdate({_id: id}, req.body, { new: true });
  !results && next(new AppError("not found User", 404));
  results && res.json({ message: "Done", results });
});

const setUserRoleToAdmin = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let results = await userModel.findByIdAndUpdate(id, { role: 'admin' }, { new: true });
  !results && next(new AppError("not found User", 404));
  results && res.json({ message: "User role updated to admin", results });
});

export { createUser, getAllUser, getUserById, updateUser, deleteUser, changePassword, setUserRoleToAdmin };
