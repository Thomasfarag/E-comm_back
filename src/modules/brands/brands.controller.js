import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import AppError from "../../utils/services/AppError.js";
import catchAsyncError from "../../utils/middleware/catchAyncError.js";
import { brandModel } from '../../../databases/models/brand.model.js';
import ApiFeatures from '../../utils/APIFeatures.js';

const createBrand = catchAsyncError(async (req, res, next) => {
    req.body.slug = slugify(req.body.name); 
    req.body.logo = req.file.filename;
    let results = new brandModel(req.body);
    let added = await results.save();
    res.status(201).json({ message: "added", added });
});

const getAllBrand = catchAsyncError(async (req, res, next) => {
    let apiFeature = new ApiFeatures(brandModel.find(), req.query).sort().search().fields();
    let results = await apiFeature.mongooseQuery;
    res.json({ message: "Done", results });
});

const getBrandById = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    let results = await brandModel.findById(id);
    res.json({ message: "Done", results });
});

const updateBrand = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    req.body.slug = slugify(req.body.name);
    if (req.file) req.body.logo = req.file.filename;
    let results = await brandModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!results) return next(new AppError("not found Brand", 404));
    res.json({ message: "Done", results });
});

const deleteBrand = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    const brand = await brandModel.findById(id);
    if (!brand) return next(new AppError("Brand not found", 404));

    // Extract the filename from the path
    const logoFilename = brand.logo.split('\\').pop().split('/').pop();
    const logoPath = path.join('uploads', logoFilename);

    // Log the path before attempting to delete the file
    console.log("Attempting to delete brand photo at path:", logoPath);

    // Check if the file exists before attempting to delete
    if (fs.existsSync(logoPath)) {
        fs.unlink(logoPath, (err) => {
            if (err) {
                console.error("Failed to delete brand photo:", err);
            }
        });
    } else {
        console.log("File not found, skipping deletion:", logoPath);
    }

    await brandModel.findByIdAndDelete(id);
    res.status(204).json({ message: "Brand and associated photo deleted" });
});

export {
    createBrand,
    getAllBrand,
    getBrandById,
    updateBrand,
    deleteBrand
};
