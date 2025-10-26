// import SellOpportunity from "../models/sellopportunityModel.js";
// import mongoose from "mongoose";

// // Create a new sell opportunity
// export const createSellOpportunity = async (req, res) => {
//     try {
//         const {
//             // 1. PERSONAL DETAIL
//             owner,
//             source,
//             status,
//             stage,
//             email,
//             phoneNumber,
//             state,
//             city,

//             // 2. CAR DETAILS
//             monthOfRegistration,
//             yearOfRegistration,
//             monthOfManufacturing,
//             yearOfManufacturing,
//             make,
//             model,
//             variant,
//             color,
//             sunroof,
//             fuelType,
//             ownership,

//             // 3. REGISTRATION & INSURANCE DETAILS
//             registrationType,
//             registrationState,
//             registrationNumber,
//             insuranceType,
//             insuranceCompany,
//             insuranceExpiryDate,

//             // 4. KILOMETERS AND PRICING
//             kilometersDriven,
//             expectedSellingPrice,
//             documents,
//             notes,

//             // 5. OTHERS
//             secondKeyAvailable,
//             servicePackage,
//             warrantyValidity,

//             // Files
//             carImages,
//             rcUpload,
//             serviceHistory,

//             leadId
//         } = req.body;

//         // Validate required fields
//         if (!owner || !source || !stage || !make || !model) {
//             return res.status(400).json({ 
//                 status: "error",
//                 message: "Please provide all required fields (owner, source, stage, make, model)." 
//             });
//         }

//         const newSellOpportunity = new SellOpportunity({
//             // 1. PERSONAL DETAIL
//             owner,
//             source,
//             status: status || 'Open',
//             stage,
//             email,
//             phoneNumber,
//             state,
//             city,

//             // 2. CAR DETAILS
//             monthOfRegistration,
//             yearOfRegistration,
//             monthOfManufacturing,
//             yearOfManufacturing,
//             make,
//             model,
//             variant,
//             color,
//             sunroof: sunroof || 'No',
//             fuelType,
//             ownership,

//             // 3. REGISTRATION & INSURANCE DETAILS
//             registrationType,
//             registrationState,
//             registrationNumber,
//             insuranceType,
//             insuranceCompany,
//             insuranceExpiryDate,

//             // 4. KILOMETERS AND PRICING
//             kilometersDriven,
//             expectedSellingPrice,
//             documents: documents || 'Pending',
//             notes,

//             // 5. OTHERS
//             secondKeyAvailable: secondKeyAvailable || 'No',
//             servicePackage: servicePackage || 'No',
//             warrantyValidity: warrantyValidity || 'Normal',

//             // Files
//             carImages: carImages || [],
//             rcUpload: rcUpload || [],
//             serviceHistory: serviceHistory || [],

//             leadId
//         });

//         await newSellOpportunity.save();

//         // Populate the saved opportunity
//         const populatedOpportunity = await SellOpportunity.findById(newSellOpportunity._id)
//             .populate('owner', 'username email')
//             .populate('state', 'name')
//             .populate('city', 'name')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('registrationState', 'name')
//             .populate('leadId', 'name lastName email phone');

//         res.status(201).json({
//             status: "success",
//             message: "Sell opportunity created successfully",
//             data: populatedOpportunity
//         });

//     } catch (error) {
//         console.error("Error creating Sell Opportunity:", error);
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 status: "error",
//                 message: "Validation error",
//                 errors: errors
//             });
//         }

//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Internal server error",
//             error: error.message 
//         });
//     }
// };

// // Get all sell opportunities with filtering and pagination
// export const getAllSellOpportunities = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             sortBy = 'createdAt',
//             sortOrder = 'desc',
//             search,
//             status,
//             stage,
//             owner,
//             source,
//             make,
//             model,
//             state,
//             city,
//             startDate,
//             endDate
//         } = req.query;

//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
//         const skip = (pageNum - 1) * limitNum;

//         // Build filter object
//         const filter = {};
        
//         if (search) {
//             filter.$or = [
//                 { email: { $regex: search, $options: 'i' } },
//                 { phoneNumber: { $regex: search, $options: 'i' } },
//                 { registrationNumber: { $regex: search, $options: 'i' } },
//                 { notes: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;
//         if (owner) filter.owner = owner;
//         if (source) filter.source = source;
//         if (make) filter.make = make;
//         if (model) filter.model = model;
//         if (state) filter.state = state;
//         if (city) filter.city = city;

//         // Date range filter
//         if (startDate || endDate) {
//             filter.createdAt = {};
//             if (startDate) filter.createdAt.$gte = new Date(startDate);
//             if (endDate) filter.createdAt.$lte = new Date(endDate);
//         }

//         // Build sort object
//         const sort = {};
//         sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const opportunities = await SellOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('state', 'name')
//             .populate('city', 'name')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('registrationState', 'name')
//             .populate('leadId', 'name lastName email phone')
//             .sort(sort)
//             .skip(skip)
//             .limit(limitNum);

//         const total = await SellOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunities fetched successfully",
//             data: opportunities,
//             pagination: {
//                 currentPage: pageNum,
//                 totalPages,
//                 totalRecords: total,
//                 hasNext: pageNum < totalPages,
//                 hasPrev: pageNum > 1
//             }
//         });

//     } catch (error) {
//         console.error("Error fetching sell opportunities:", error);
//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch sell opportunities",
//             error: error.message 
//         });
//     }
// };

// // Get sell opportunity by ID
// export const getSellOpportunityById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         const opportunity = await SellOpportunity.findById(id)
//             .populate('owner', 'username email')
//             .populate('state', 'name')
//             .populate('city', 'name')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('registrationState', 'name')
//             .populate('leadId', 'name lastName email phone');

//         if (!opportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Sell opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunity fetched successfully",
//             data: opportunity
//         });

//     } catch (error) {
//         console.error("Error fetching sell opportunity:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch sell opportunity",
//             error: error.message 
//         });
//     }
// };

// // Update sell opportunity
// export const updateSellOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         // Remove immutable fields
//         delete updateData._id;
//         delete updateData.createdAt;
//         delete updateData.updatedAt;

//         const updatedOpportunity = await SellOpportunity.findByIdAndUpdate(
//             id,
//             { $set: updateData },
//             { 
//                 new: true, 
//                 runValidators: true,
//                 context: 'query'
//             }
//         )
//         .populate('owner', 'username email')
//         .populate('state', 'name')
//         .populate('city', 'name')
//         .populate('make', 'name')
//         .populate('model', 'name')
//         .populate('variant', 'name')
//         .populate('registrationState', 'name')
//         .populate('leadId', 'name lastName email phone');

//         if (!updatedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Sell opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunity updated successfully",
//             data: updatedOpportunity
//         });

//     } catch (error) {
//         console.error("Error updating sell opportunity:", error);
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 status: "error",
//                 message: "Validation error",
//                 errors: errors
//             });
//         }

//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to update sell opportunity",
//             error: error.message 
//         });
//     }
// };

// // Delete sell opportunity
// export const deleteSellOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         const deletedOpportunity = await SellOpportunity.findByIdAndDelete(id);

//         if (!deletedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Sell opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunity deleted successfully",
//             data: {
//                 id: deletedOpportunity._id
//             }
//         });

//     } catch (error) {
//         console.error("Error deleting sell opportunity:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to delete sell opportunity",
//             error: error.message 
//         });
//     }
// };

// // Get sell opportunities by lead ID
// export const getSellOpportunitiesByLead = async (req, res) => {
//     try {
//         const { leadId } = req.params;
//         const { page = 1, limit = 10 } = req.query;

//         if (!mongoose.Types.ObjectId.isValid(leadId)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid lead ID format"
//             });
//         }

//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
//         const skip = (pageNum - 1) * limitNum;

//         const opportunities = await SellOpportunity.find({ leadId })
//             .populate('owner', 'username email')
//             .populate('state', 'name')
//             .populate('city', 'name')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('registrationState', 'name')
//             .populate('leadId', 'name lastName email phone')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNum);

//         const total = await SellOpportunity.countDocuments({ leadId });
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunities fetched successfully",
//             data: opportunities,
//             pagination: {
//                 currentPage: pageNum,
//                 totalPages,
//                 totalRecords: total,
//                 hasNext: pageNum < totalPages,
//                 hasPrev: pageNum > 1
//             }
//         });

//     } catch (error) {
//         console.error("Error fetching sell opportunities by lead:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid lead ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch sell opportunities",
//             error: error.message 
//         });
//     }
// };

// // Get sell opportunities by owner
// export const getSellOpportunitiesByOwner = async (req, res) => {
//     try {
//         const { ownerId } = req.params;
//         const { status, stage, page = 1, limit = 10 } = req.query;

//         if (!mongoose.Types.ObjectId.isValid(ownerId)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid owner ID format"
//             });
//         }

//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
//         const skip = (pageNum - 1) * limitNum;

//         const filter = { owner: ownerId };
//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;

//         const opportunities = await SellOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('state', 'name')
//             .populate('city', 'name')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('registrationState', 'name')
//             .populate('leadId', 'name lastName email phone')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNum);

//         const total = await SellOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Sell opportunities fetched successfully",
//             data: opportunities,
//             pagination: {
//                 currentPage: pageNum,
//                 totalPages,
//                 totalRecords: total,
//                 hasNext: pageNum < totalPages,
//                 hasPrev: pageNum > 1
//             }
//         });

//     } catch (error) {
//         console.error("Error fetching sell opportunities by owner:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid owner ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch sell opportunities",
//             error: error.message 
//         });
//     }
// };

// // Update opportunity status
// export const updateOpportunityStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         if (!status || !['Open', 'Won', 'Lost'].includes(status)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Valid status is required (Open, Won, Lost)"
//             });
//         }

//         const updatedOpportunity = await SellOpportunity.findByIdAndUpdate(
//             id,
//             { status },
//             { new: true }
//         )
//         .populate('owner', 'username email')
//         .populate('state', 'name')
//         .populate('city', 'name')
//         .populate('make', 'name')
//         .populate('model', 'name')
//         .populate('variant', 'name')
//         .populate('registrationState', 'name')
//         .populate('leadId', 'name lastName email phone');

//         if (!updatedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Sell opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Opportunity status updated successfully",
//             data: updatedOpportunity
//         });

//     } catch (error) {
//         console.error("Error updating opportunity status:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to update opportunity status",
//             error: error.message 
//         });
//     }
// };

// // Get opportunity statistics
// export const getOpportunityStats = async (req, res) => {
//     try {
//         const { ownerId, startDate, endDate } = req.query;

//         const filter = {};
//         if (ownerId) filter.owner = ownerId;
        
//         if (startDate || endDate) {
//             filter.createdAt = {};
//             if (startDate) filter.createdAt.$gte = new Date(startDate);
//             if (endDate) filter.createdAt.$lte = new Date(endDate);
//         }

//         const stats = await SellOpportunity.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: null,
//                     total: { $sum: 1 },
//                     open: {
//                         $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
//                     },
//                     won: {
//                         $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] }
//                     },
//                     lost: {
//                         $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] }
//                     },
//                     totalExpectedPrice: {
//                         $sum: "$expectedSellingPrice"
//                     }
//                 }
//             }
//         ]);

//         const stageStats = await SellOpportunity.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$stage",
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const sourceStats = await SellOpportunity.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$source",
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             status: "success",
//             message: "Opportunity statistics fetched successfully",
//             data: {
//                 overall: stats[0] || { total: 0, open: 0, won: 0, lost: 0, totalExpectedPrice: 0 },
//                 byStage: stageStats,
//                 bySource: sourceStats
//             }
//         });

//     } catch (error) {
//         console.error("Error fetching opportunity statistics:", error);
//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch opportunity statistics",
//             error: error.message 
//         });
//     }
// };


// // Upload files for sell opportunity
// export const uploadSellOpportunityFiles = async (req, res) => {
//     try {
//         if (!req.files || Object.keys(req.files).length === 0) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "No files uploaded"
//             });
//         }

//         const uploadedFiles = {
//             carImages: [],
//             rcUpload: [],
//             serviceHistory: []
//         };

//         // Process car images
//         if (req.files.carImages) {
//             uploadedFiles.carImages = req.files.carImages.map(file => ({
//                 filename: file.filename,
//                 originalName: file.originalname,
//                 mimetype: file.mimetype,
//                 size: file.size,
//                 fileUrl: `/uploads/sellOpportunity/${file.filename}`,
//                 uploadedAt: new Date()
//             }));
//         }

//         // Process RC upload
//         if (req.files.rcUpload) {
//             uploadedFiles.rcUpload = req.files.rcUpload.map(file => ({
//                 filename: file.filename,
//                 originalName: file.originalname,
//                 mimetype: file.mimetype,
//                 size: file.size,
//                 fileUrl: `/uploads/sellOpportunity/${file.filename}`,
//                 uploadedAt: new Date()
//             }));
//         }

//         // Process service history
//         if (req.files.serviceHistory) {
//             uploadedFiles.serviceHistory = req.files.serviceHistory.map(file => ({
//                 filename: file.filename,
//                 originalName: file.originalname,
//                 mimetype: file.mimetype,
//                 size: file.size,
//                 fileUrl: `/uploads/sellOpportunity/${file.filename}`,
//                 uploadedAt: new Date()
//             }));
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Files uploaded successfully",
//             files: uploadedFiles
//         });

//     } catch (error) {
//         console.error("Error uploading files:", error);
//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to upload files",
//             error: error.message 
//         });
//     }
// };


import SellOpportunity from "../models/sellopportunityModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Create a new sell opportunity
export const createSellOpportunity = async (req, res) => {

    try {
        const {
            // 1. PERSONAL DETAIL
            owner,
            source,
            status,
            stage,
            email,
            phoneNumber,
            state,
            city,

            // 2. CAR DETAILS
            monthOfRegistration,
            yearOfRegistration,
            monthOfManufacturing,
            yearOfManufacturing,
            make,
            model,
            variant,
            color,
            sunroof,
            fuelType,
            ownership,

            // 3. REGISTRATION & INSURANCE DETAILS
            registrationType,
            registrationState,
            registrationNumber,
            insuranceType,
            insuranceCompany,
            insuranceExpiryDate,

            // 4. KILOMETERS AND PRICING
            kilometersDriven,
            expectedSellingPrice,
            documents,
            notes,

            // 5. OTHERS
            secondKeyAvailable,
            servicePackage,
            warrantyValidity,

            // Files
            carImages,
            rcUpload,
            serviceHistory,

            leadId
        } = req.body;

        // Validate required fields
        if (!owner || !source || !stage || !make || !model) {
            return res.status(400).json({ 
                status: "error",
                message: "Please provide all required fields (owner, source, stage, make, model)." 
            });
        }

        const createdBy = req.user ? req.user.id : null;

        const newSellOpportunity = new SellOpportunity({
            // 1. PERSONAL DETAIL
            owner,
            source,
            status: status || 'Open',
            stage,
            email,
            phoneNumber,
            state,
            city,

            // 2. CAR DETAILS
            monthOfRegistration,
            yearOfRegistration,
            monthOfManufacturing,
            yearOfManufacturing,
            make,
            model,
            variant,
            color,
            sunroof: sunroof || 'No',
            fuelType,
            ownership,

            // 3. REGISTRATION & INSURANCE DETAILS
            registrationType,
            registrationState,
            registrationNumber,
            insuranceType,
            insuranceCompany,
            insuranceExpiryDate,

            // 4. KILOMETERS AND PRICING
            kilometersDriven,
            expectedSellingPrice,
            documents: documents || 'Pending',
            notes,

            // 5. OTHERS
            secondKeyAvailable: secondKeyAvailable || 'No',
            servicePackage: servicePackage || 'No',
            warrantyValidity: warrantyValidity || 'Normal',

            // Files
            carImages: carImages || [],
            rcUpload: rcUpload || [],
            serviceHistory: serviceHistory || [],

            leadId,
            createdBy 
        });

        await newSellOpportunity.save();

        // Populate the saved opportunity
        const populatedOpportunity = await SellOpportunity.findById(newSellOpportunity._id)
            .populate('owner', 'username email')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('make', 'make')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('registrationState', 'name')
            .populate('leadId', 'name lastName email phone');


            console.log(populatedOpportunity)

        // Create activity for opportunity creation
        const activity = new Activity({
            user: owner,
            type: 'sell_opportunity_created',
            content: `Sell opportunity created for car ${populatedOpportunity.make.make} ${populatedOpportunity.model?.name} ${populatedOpportunity.variant?.name || ''}`,
            contentId: newSellOpportunity._id,
            leadId: newSellOpportunity.leadId,
            metadata: {
                name: populatedOpportunity.leadId.name || "N/A",
                source : source,
                email,
                phoneNumber,
                stage,
                make : populatedOpportunity.make.make || "N/A",
                model : populatedOpportunity.model.name || "N/A",
                variant : populatedOpportunity.variant?.name || "N/A",
                expectedSellingPrice,
                registrationNumber,
                status: status || 'Open',
                
            }
        });

        await activity.save();

        res.status(201).json({
            status: "success",
            message: "Sell opportunity created successfully",
            data: populatedOpportunity
        });

    } catch (error) {
        console.error("Error creating Sell Opportunity:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                errors: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Internal server error",
            error: error.message 
        });
    }
};

// Get all sell opportunities with filtering and pagination
export const getAllSellOpportunities = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            status,
            stage,
            owner,
            source,
            make,
            model,
            state,
            city,
            startDate,
            endDate
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (owner) filter.owner = owner;
        if (source) filter.source = source;
        if (make) filter.make = make;
        if (model) filter.model = model;
        if (state) filter.state = state;
        if (city) filter.city = city;

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        if(req.user.role !== 'Super Admin') filter.createdBy = req.user.id;

        const opportunities = await SellOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('registrationState', 'name')
            .populate('leadId', 'name lastName email phone')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await SellOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Sell opportunities fetched successfully",
            data: opportunities,

            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error("Error fetching sell opportunities:", error);
        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch sell opportunities",
            error: error.message 
        });
    }
};

// Get sell opportunity by ID
export const getSellOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        const opportunity = await SellOpportunity.findById(id)
            .populate('owner', 'username email')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('registrationState', 'name')
            .populate('leadId', 'name lastName email phone');

        if (!opportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Sell opportunity fetched successfully",
            data: opportunity
        });

    } catch (error) {
        console.error("Error fetching sell opportunity:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch sell opportunity",
            error: error.message 
        });
    }
};

// Update sell opportunity
export const updateSellOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        // Get the current opportunity data before update
        const currentOpportunity = await SellOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }
 
        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        console.log(updateData);
        const updatedOpportunity = await SellOpportunity.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        )
        .populate('owner', 'username email')
        .populate('state', 'name')
        .populate('city', 'name')
        .populate('make', 'name')
        .populate('model', 'name')
        .populate('variant', 'name')
        .populate('registrationState', 'name')
        .populate('leadId', 'name lastName email phone');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        // Create activity for opportunity update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'sell_opportunity_updated',
            content: `Sell opportunity updated for car ${updatedOpportunity.make?.name || ''} ${updatedOpportunity.model?.name || ''}`,
            contentId: updatedOpportunity._id,
            leadId: updatedOpportunity.leadId,
            metadata: {
                previousData: {
                    status: currentOpportunity.status,
                    stage: currentOpportunity.stage,
                    expectedSellingPrice: currentOpportunity.expectedSellingPrice,
                    registrationNumber: currentOpportunity.registrationNumber
                },
                updatedData: {
                    status: updatedOpportunity.status,
                    stage: updatedOpportunity.stage,
                    expectedSellingPrice: updatedOpportunity.expectedSellingPrice,
                    registrationNumber: updatedOpportunity.registrationNumber
                },
                changes: Object.keys(updateData)
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Sell opportunity updated successfully",
            data: updatedOpportunity
        });

    } catch (error) {
        console.error("Error updating sell opportunity:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                errors: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to update sell opportunity",
            error: error.message 
        });
    }
};

// Delete sell opportunity
export const deleteSellOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        const deletedOpportunity = await SellOpportunity.findByIdAndDelete(id);

        if (!deletedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        // Create activity for opportunity deletion
        const activity = new Activity({
            user: req.user?._id || deletedOpportunity.owner,
            type: 'sell_opportunity_deleted',
            content: `Sell opportunity deleted for car ${deletedOpportunity.make?.name || ''} ${deletedOpportunity.model?.name || ''}`,
            contentId: deletedOpportunity._id,
            leadId: deletedOpportunity.leadId,
            metadata: {
                registrationNumber: deletedOpportunity.registrationNumber,
                expectedSellingPrice: deletedOpportunity.expectedSellingPrice,
                status: deletedOpportunity.status,
                stage: deletedOpportunity.stage,
                leadId: deletedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Sell opportunity deleted successfully",
            data: {
                id: deletedOpportunity._id,
                registrationNumber: deletedOpportunity.registrationNumber
            }
        });

    } catch (error) {
        console.error("Error deleting sell opportunity:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to delete sell opportunity",
            error: error.message 
        });
    }
};

// Get sell opportunities by lead ID
export const getSellOpportunitiesByLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid lead ID format"
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const opportunities = await SellOpportunity.find({ leadId })
            .populate('owner', 'username email')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('registrationState', 'name')
            .populate('leadId', 'name lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await SellOpportunity.countDocuments({ leadId });
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Sell opportunities fetched successfully",
            data: opportunities,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error("Error fetching sell opportunities by lead:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid lead ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch sell opportunities",
            error: error.message 
        });
    }
};

// Get sell opportunities by owner
export const getSellOpportunitiesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status, stage, page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid owner ID format"
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const filter = { owner: ownerId };
        if (status) filter.status = status;
        if (stage) filter.stage = stage;

        const opportunities = await SellOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('registrationState', 'name')
            .populate('leadId', 'name lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await SellOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Sell opportunities fetched successfully",
            data: opportunities,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error("Error fetching sell opportunities by owner:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid owner ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch sell opportunities",
            error: error.message 
        });
    }
};

// Update opportunity status
export const updateOpportunityStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        if (!status || !['Open', 'Won', 'Lost'].includes(status)) {
            return res.status(400).json({
                status: "error",
                message: "Valid status is required (Open, Won, Lost)"
            });
        }

        // Get current opportunity before update
        const currentOpportunity = await SellOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        const updatedOpportunity = await SellOpportunity.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        .populate('owner', 'username email')
        .populate('state', 'name')
        .populate('city', 'name')
        .populate('make', 'name')
        .populate('model', 'name')
        .populate('variant', 'name')
        .populate('registrationState', 'name')
        .populate('leadId', 'name lastName email phone');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        // Create activity for status update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'sell_opportunity_status_updated',
            content: `Sell opportunity status changed from "${currentOpportunity.status}" to "${status}" for car ${updatedOpportunity.make?.name || ''} ${updatedOpportunity.model?.name || ''}`,
            contentId: updatedOpportunity._id,
            leadId: updatedOpportunity.leadId,
            metadata: {
                previousStatus: currentOpportunity.status,
                newStatus: status,
                registrationNumber: updatedOpportunity.registrationNumber,
                expectedSellingPrice: updatedOpportunity.expectedSellingPrice,
                leadId: updatedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Opportunity status updated successfully",
            data: updatedOpportunity
        });

    } catch (error) {
        console.error("Error updating opportunity status:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to update opportunity status",
            error: error.message 
        });
    }
};

// Update opportunity stage
export const updateOpportunityStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        if (!stage) {
            return res.status(400).json({
                status: "error",
                message: "Stage is required"
            });
        }

        // Get current opportunity before update
        const currentOpportunity = await SellOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        const updatedOpportunity = await SellOpportunity.findByIdAndUpdate(
            id,
            { stage },
            { new: true }
        )
        .populate('owner', 'username email')
        .populate('state', 'name')
        .populate('city', 'name')
        .populate('make', 'name')
        .populate('model', 'name')
        .populate('variant', 'name')
        .populate('registrationState', 'name')
        .populate('leadId', 'name lastName email phone');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Sell opportunity not found"
            });
        }

        // Create activity for stage update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'sell_opportunity_stage_updated',
            content: `Sell opportunity stage changed from "${currentOpportunity.stage}" to "${stage}" for car ${updatedOpportunity.make?.name || ''} ${updatedOpportunity.model?.name || ''}`,
            contentId: updatedOpportunity._id,
            leadId: updatedOpportunity.leadId,
            metadata: {
                previousStage: currentOpportunity.stage,
                newStage: stage,
                registrationNumber: updatedOpportunity.registrationNumber,
                status: updatedOpportunity.status,
                leadId: updatedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Opportunity stage updated successfully",
            data: updatedOpportunity
        });

    } catch (error) {
        console.error("Error updating opportunity stage:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to update opportunity stage",
            error: error.message 
        });
    }
};

// Get opportunity statistics
export const getOpportunityStats = async (req, res) => {
    try {
        const { ownerId, startDate, endDate } = req.query;

        const filter = {};
        if (ownerId) filter.owner = ownerId;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const stats = await SellOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    open: {
                        $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
                    },
                    won: {
                        $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] }
                    },
                    lost: {
                        $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] }
                    },
                    totalExpectedPrice: {
                        $sum: "$expectedSellingPrice"
                    },
                    averageExpectedPrice: {
                        $avg: "$expectedSellingPrice"
                    }
                }
            }
        ]);

        const stageStats = await SellOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$expectedSellingPrice" }
                }
            }
        ]);

        const sourceStats = await SellOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$source",
                    count: { $sum: 1 }
                }
            }
        ]);

        const makeStats = await SellOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$make",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            status: "success",
            message: "Opportunity statistics fetched successfully",
            data: {
                overall: stats[0] || { 
                    total: 0, 
                    open: 0, 
                    won: 0, 
                    lost: 0, 
                    totalExpectedPrice: 0,
                    averageExpectedPrice: 0 
                },
                byStage: stageStats,
                bySource: sourceStats,
                byMake: makeStats
            }
        });

    } catch (error) {
        console.error("Error fetching opportunity statistics:", error);
        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch opportunity statistics",
            error: error.message 
        });
    }
};

// Upload files for sell opportunity
export const uploadSellOpportunityFiles = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No files uploaded"
            });
        }

        const uploadedFiles = {
            carImages: [],
            rcUpload: [],
            serviceHistory: []
        };

        // Process car images
        if (req.files.carImages) {
            uploadedFiles.carImages = req.files.carImages.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                fileUrl: `/uploads/sellOpportunity/${file.filename}`,
                uploadedAt: new Date()
            }));
        }

        // Process RC upload
        if (req.files.rcUpload) {
            uploadedFiles.rcUpload = req.files.rcUpload.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                fileUrl: `/uploads/sellOpportunity/${file.filename}`,
                uploadedAt: new Date()
            }));
        }

        // Process service history
        if (req.files.serviceHistory) {
            uploadedFiles.serviceHistory = req.files.serviceHistory.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                fileUrl: `/uploads/sellOpportunity/${file.filename}`,
                uploadedAt: new Date()
            }));
        }

        res.status(200).json({
            status: "success",
            message: "Files uploaded successfully",
            files: uploadedFiles
        });

    } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ 
            status: "error",
            message: "Failed to upload files",
            error: error.message 
        });
    }
};