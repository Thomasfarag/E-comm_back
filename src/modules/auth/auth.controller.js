import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import { userModel } from '../../../databases/models/user.model.js';
import AppError from "../../utils/services/AppError.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUp = catchAsyncError(async (req, res, next) => {
    let isFound = await userModel.findOne({ email: req.body.email });
    if (isFound) return next(new AppError("Email already exists", 409));
    
    let usersCount = await userModel.countDocuments();
    let role = usersCount === 0 ? 'admin' : 'user';
    
    let user = new userModel({ ...req.body, role });
    await user.save();
    
    res.json({ message: "added", user });
});

export const signIn = catchAsyncError(async (req, res, next) => {
    let { email, password } = req.body;
    let isFound = await userModel.findOne({ email });
    if (!isFound) return next(new AppError("Incorrect email or password", 401));

    const match = await bcrypt.compare(password, isFound.password);
    if (!match) return next(new AppError("Incorrect email or password", 401));

    let token = jwt.sign({ name: isFound.name, userId: isFound._id, role: isFound.role }, "treka");
    res.json({ message: "success", token });
});

export const protectRoutes = catchAsyncError(async (req, res, next) => {
    let { token } = req.headers;
    if (!token) return next(new AppError("Please provide token", 401));

    let decoded = await jwt.verify(token, "treka");
    let user = await userModel.findById(decoded.userId);
    if (!user) return next(new AppError("Invalid user", 404));

    if (user.changePasswordAt) {
        let changePasswordTime = parseInt(user.changePasswordAt.getTime() / 1000);
        if (changePasswordTime > decoded.iat) return next(new AppError("Token invalid", 401));
    }

    req.user = user;
    next();
});

export const allowTo = (...roles) => {
    return catchAsyncError((req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError("Not authorized", 403));
        next();
    });
};
