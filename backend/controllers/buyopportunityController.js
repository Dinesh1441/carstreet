// import BuyOpportunity from "../models/buyopportunityModel.js";
// import Activity from "../models/activityModel.js";
// import mongoose from "mongoose";

// // Create a new buy opportunity
// export const createBuyOpportunity = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phoneNumber,
//             car,
//             owner,
//             source,
//             status,
//             stage,
//             year,
//             minBudget,
//             maxBudget,
//             make,
//             model,
//             variant,
//             colour,
//             carStatus,
//             carAvailabilityStatus,
//             carId,
//             buyingIntent,
//             finance,
//             financeAmount,
//             rto,
//             rtoTransferName,
//             rtoChoiceNumber,
//             rtoProcessToBeDone,
//             rtoRequiredState,
//             rtoProcess,
//             insurance,
//             leadId
//         } = req.body;

//         // Validate required fields
//         if (!name || !owner || !source || !stage || !make || !model || !finance || !rto || !insurance || !leadId) {
//             return res.status(400).json({ 
//                 status: "error",
//                 message: "Please provide all required fields." 
//             });
//         }

//         const newBuyOpportunity = new BuyOpportunity({
//             name,
//             email,
//             phoneNumber,
//             car,
//             owner,
//             source,
//             status,
//             stage,
//             year,
//             minBudget,
//             maxBudget,
//             make,
//             model,
//             variant,
//             colour,
//             carStatus,
//             carAvailabilityStatus,
//             carId,
//             buyingIntent,
//             finance,
//             financeAmount,
//             rto,
//             rtoTransferName,
//             rtoChoiceNumber,
//             rtoProcessToBeDone,
//             rtoRequiredState,
//             rtoProcess,
//             insurance,
//             leadId
//         });

//         await newBuyOpportunity.save();

//         // Populate the saved opportunity
//         const populatedOpportunity = await BuyOpportunity.findById(newBuyOpportunity._id)
//             .populate('owner', 'username email')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('car', 'name')
//             .populate('leadId', 'name lastName email phone');

//         const activity = new Activity({
//             user: owner,
//             type: 'buy_opportunity_created',
//             content: `Buy opportunity created for "${name}"`,
//             contentId: newBuyOpportunity._id,
//             metadata: {
//                 email,
//                 phoneNumber,
//                 car,
//                 owner,
//                 source,
//                 status,
//                 stage,
//                 year,
//                 minBudget,
//                 maxBudget,
//                 make,
//                 model,
//                 variant,
//                 colour,
//                 carStatus,
//                 carAvailabilityStatus,
//                 carId,
//                 buyingIntent,
//                 finance,
//                 financeAmount,
//                 rto,
//                 rtoTransferName,
//                 rtoChoiceNumber,
//                 rtoProcessToBeDone,
//                 rtoRequiredState,
//                 rtoProcess,
//                 insurance,
//                 leadId
//             }
//         });

//         await activity.save();

//         res.status(201).json({
//             status: "success",
//             message: "Buy opportunity created successfully",
//             data: populatedOpportunity
//         });

//     } catch (error) {
//         console.error("Error creating Buy Opportunity:", error);
        
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

// // Get all buy opportunities with filtering and pagination
// export const getAllBuyOpportunities = async (req, res) => {
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
//             finance,
//             rto,
//             insurance,
//             leadId,
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
//                 { name: { $regex: search, $options: 'i' } },
//                 { email: { $regex: search, $options: 'i' } },
//                 { phoneNumber: { $regex: search, $options: 'i' } },
//                 { carId: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;
//         if (owner) filter.owner = owner;
//         if (source) filter.source = source;
//         if (make) filter.make = make;
//         if (model) filter.model = model;
//         if (finance) filter.finance = finance;
//         if (rto) filter.rto = rto;
//         if (insurance) filter.insurance = insurance;
//         if (leadId) filter.leadId = leadId;

//         // Date range filter
//         if (startDate || endDate) {
//             filter.createdAt = {};
//             if (startDate) filter.createdAt.$gte = new Date(startDate);
//             if (endDate) filter.createdAt.$lte = new Date(endDate);
//         }

//         // Build sort object
//         const sort = {};
//         sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const opportunities = await BuyOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('car', 'name')
//             .populate('leadId')
//             .sort(sort)
//             .skip(skip)
//             .limit(limitNum);

//         const total = await BuyOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunities fetched successfully",
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
//         console.error("Error fetching buy opportunities:", error);
//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch buy opportunities",
//             error: error.message 
//         });
//     }
// };

// // Get buy opportunity by ID
// export const getBuyOpportunityById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         const opportunity = await BuyOpportunity.findById(id)
//             .populate('owner', 'username email')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('car', 'name')
//             .populate('leadId', 'name lastName email phone');

//         if (!opportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Buy opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunity fetched successfully",
//             data: opportunity
//         });

//     } catch (error) {
//         console.error("Error fetching buy opportunity:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch buy opportunity",
//             error: error.message 
//         });
//     }
// };

// // Update buy opportunity
// export const updateBuyOpportunity = async (req, res) => {
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

//         const updatedOpportunity = await BuyOpportunity.findByIdAndUpdate(
//             id,
//             { $set: updateData },
//             { 
//                 new: true, 
//                 runValidators: true,
//                 context: 'query'
//             }
//         )
//         .populate('owner', 'username email')
//         .populate('make', 'name')
//         .populate('model', 'name')
//         .populate('variant', 'name')
//         .populate('car', 'name')
//         .populate('leadId', 'name lastName email phone');

//         if (!updatedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Buy opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunity updated successfully",
//             data: updatedOpportunity
//         });

//     } catch (error) {
//         console.error("Error updating buy opportunity:", error);
        
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
//             message: "Failed to update buy opportunity",
//             error: error.message 
//         });
//     }
// };

// // Delete buy opportunity
// export const deleteBuyOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         const deletedOpportunity = await BuyOpportunity.findByIdAndDelete(id);

//         if (!deletedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Buy opportunity not found"
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunity deleted successfully",
//             data: {
//                 id: deletedOpportunity._id,
//                 name: deletedOpportunity.name
//             }
//         });

//     } catch (error) {
//         console.error("Error deleting buy opportunity:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid opportunity ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to delete buy opportunity",
//             error: error.message 
//         });
//     }
// };

// // Get buy opportunities by lead ID
// export const getBuyOpportunitiesByLead = async (req, res) => {
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

//         const opportunities = await BuyOpportunity.find({ leadId })
//             .populate('owner', 'username email')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('car', 'name')
//             .populate('leadId', 'name lastName email phone')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNum);

//         const total = await BuyOpportunity.countDocuments({ leadId });
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunities fetched successfully",
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
//         console.error("Error fetching buy opportunities by lead:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid lead ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch buy opportunities",
//             error: error.message 
//         });
//     }
// };

// // Get buy opportunities by owner
// export const getBuyOpportunitiesByOwner = async (req, res) => {
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

//         const opportunities = await BuyOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('make', 'name')
//             .populate('model', 'name')
//             .populate('variant', 'name')
//             .populate('car', 'name')
//             .populate('leadId', 'name lastName email phone')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNum);

//         const total = await BuyOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: "success",
//             message: "Buy opportunities fetched successfully",
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
//         console.error("Error fetching buy opportunities by owner:", error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid owner ID format"
//             });
//         }

//         res.status(500).json({ 
//             status: "error",
//             message: "Failed to fetch buy opportunities",
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

//         const updatedOpportunity = await BuyOpportunity.findByIdAndUpdate(
//             id,
//             { status },
//             { new: true }
//         )
//         .populate('owner', 'username email')
//         .populate('make', 'name')
//         .populate('model', 'name')
//         .populate('variant', 'name')
//         .populate('car', 'name')
//         .populate('leadId', 'name lastName email phone');

//         if (!updatedOpportunity) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "Buy opportunity not found"
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

//         const stats = await BuyOpportunity.aggregate([
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
//                     totalBudget: {
//                         $sum: { $add: ["$minBudget", "$maxBudget"] }
//                     }
//                 }
//             }
//         ]);

//         const stageStats = await BuyOpportunity.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$stage",
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             status: "success",
//             message: "Opportunity statistics fetched successfully",
//             data: {
//                 overall: stats[0] || { total: 0, open: 0, won: 0, lost: 0, totalBudget: 0 },
//                 byStage: stageStats
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


import BuyOpportunity from "../models/buyopportunityModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Create a new buy opportunity
export const createBuyOpportunity = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            car,
            owner,
            source,
            status,
            stage,
            year,
            minBudget,
            maxBudget,
            make,
            model,
            variant,
            colour,
            carStatus,
            carAvailabilityStatus,
            carId,
            buyingIntent,
            finance,
            financeAmount,
            rto,
            rtoTransferName,
            rtoChoiceNumber,
            rtoProcessToBeDone,
            rtoRequiredState,
            rtoProcess,
            insurance,
            leadId
        } = req.body;

        // Validate required fields
        if (!name || !owner || !source || !stage || !make || !model || !finance || !rto || !insurance || !leadId) {
            return res.status(400).json({ 
                status: "error",
                message: "Please provide all required fields." 
            });
        }

        const newBuyOpportunity = new BuyOpportunity({
            name,
            email,
            phoneNumber,
            car,
            owner,
            source,
            status,
            stage,
            year,
            minBudget,
            maxBudget,
            make,
            model,
            variant,
            colour,
            carStatus,
            carAvailabilityStatus,
            carId,
            buyingIntent,
            finance,
            financeAmount,
            rto,
            rtoTransferName,
            rtoChoiceNumber,
            rtoProcessToBeDone,
            rtoRequiredState,
            rtoProcess,
            insurance,
            leadId
        });

        await newBuyOpportunity.save();

        // Populate the saved opportunity
        const populatedOpportunity = await BuyOpportunity.findById(newBuyOpportunity._id)
            .populate('owner', 'username email')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('car', 'name')
            .populate('leadId', 'name lastName email phone');

        // Create activity for opportunity creation
        const activity = new Activity({
            user: owner,
            type: 'buy_opportunity_created',
            content: `Buy opportunity created for "${name}"`,
            contentId: newBuyOpportunity._id,
            metadata: {
                email,
                phoneNumber,
                car,
                owner,
                source,
                status,
                stage,
                year,
                minBudget,
                maxBudget,
                make,
                model,
                variant,
                colour,
                carStatus,
                carAvailabilityStatus,
                carId,
                buyingIntent,
                finance,
                financeAmount,
                rto,
                rtoTransferName,
                rtoChoiceNumber,
                rtoProcessToBeDone,
                rtoRequiredState,
                rtoProcess,
                insurance,
                leadId
            }
        });

        await activity.save();

        res.status(201).json({
            status: "success",
            message: "Buy opportunity created successfully",
            data: populatedOpportunity
        });

    } catch (error) {
        console.error("Error creating Buy Opportunity:", error);
        
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

// Get all buy opportunities with filtering and pagination
export const getAllBuyOpportunities = async (req, res) => {
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
            finance,
            rto,
            insurance,
            leadId,
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
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { carId: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (owner) filter.owner = owner;
        if (source) filter.source = source;
        if (make) filter.make = make;
        if (model) filter.model = model;
        if (finance) filter.finance = finance;
        if (rto) filter.rto = rto;
        if (insurance) filter.insurance = insurance;
        if (leadId) filter.leadId = leadId;

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const opportunities = await BuyOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('car', 'name')
            .populate('leadId')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await BuyOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Buy opportunities fetched successfully",
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
        console.error("Error fetching buy opportunities:", error);
        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch buy opportunities",
            error: error.message 
        });
    }
};

// Get buy opportunity by ID
export const getBuyOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        const opportunity = await BuyOpportunity.findById(id)
            .populate('owner', 'username email')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('car', 'name')
            .populate('leadId', 'name lastName email phone');

        if (!opportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Buy opportunity fetched successfully",
            data: opportunity
        });

    } catch (error) {
        console.error("Error fetching buy opportunity:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch buy opportunity",
            error: error.message 
        });
    }
};

// Update buy opportunity
export const updateBuyOpportunity = async (req, res) => {
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
        const currentOpportunity = await BuyOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedOpportunity = await BuyOpportunity.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        )
        .populate('owner', 'username email')
        .populate('make', 'name')
        .populate('model', 'name')
        .populate('variant', 'name')
        .populate('car', 'name')
        .populate('leadId', 'name lastName email phone');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        // Create activity for opportunity update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'buy_opportunity_updated',
            content: `Buy opportunity updated for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousData: {
                    name: currentOpportunity.name,
                    status: currentOpportunity.status,
                    stage: currentOpportunity.stage,
                    // Add other important fields that were changed
                },
                updatedData: {
                    name: updatedOpportunity.name,
                    status: updatedOpportunity.status,
                    stage: updatedOpportunity.stage,
                    // Add other important fields that were changed
                },
                changes: Object.keys(updateData)
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Buy opportunity updated successfully",
            data: updatedOpportunity
        });

    } catch (error) {
        console.error("Error updating buy opportunity:", error);
        
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
            message: "Failed to update buy opportunity",
            error: error.message 
        });
    }
};

// Delete buy opportunity
export const deleteBuyOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        const deletedOpportunity = await BuyOpportunity.findByIdAndDelete(id);

        if (!deletedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        // Create activity for opportunity deletion
        const activity = new Activity({
            user: req.user?._id || deletedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'buy_opportunity_deleted',
            content: `Buy opportunity deleted for "${deletedOpportunity.name}"`,
            contentId: deletedOpportunity._id,
            metadata: {
                name: deletedOpportunity.name,
                email: deletedOpportunity.email,
                phoneNumber: deletedOpportunity.phoneNumber,
                status: deletedOpportunity.status,
                stage: deletedOpportunity.stage,
                leadId: deletedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: "success",
            message: "Buy opportunity deleted successfully",
            data: {
                id: deletedOpportunity._id,
                name: deletedOpportunity.name
            }
        });

    } catch (error) {
        console.error("Error deleting buy opportunity:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid opportunity ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to delete buy opportunity",
            error: error.message 
        });
    }
};

// Get buy opportunities by lead ID
export const getBuyOpportunitiesByLead = async (req, res) => {
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

        const opportunities = await BuyOpportunity.find({ leadId })
            .populate('owner', 'username email')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('car', 'name')
            .populate('leadId', 'name lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await BuyOpportunity.countDocuments({ leadId });
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Buy opportunities fetched successfully",
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
        console.error("Error fetching buy opportunities by lead:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid lead ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch buy opportunities",
            error: error.message 
        });
    }
};

// Get buy opportunities by owner
export const getBuyOpportunitiesByOwner = async (req, res) => {
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

        const opportunities = await BuyOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('make', 'name')
            .populate('model', 'name')
            .populate('variant', 'name')
            .populate('car', 'name')
            .populate('leadId', 'name lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await BuyOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: "success",
            message: "Buy opportunities fetched successfully",
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
        console.error("Error fetching buy opportunities by owner:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: "error",
                message: "Invalid owner ID format"
            });
        }

        res.status(500).json({ 
            status: "error",
            message: "Failed to fetch buy opportunities",
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
        const currentOpportunity = await BuyOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        const updatedOpportunity = await BuyOpportunity.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        .populate('owner', 'username email')
        .populate('make', 'name')
        .populate('model', 'name')
        .populate('variant', 'name')
        .populate('car', 'name')
        .populate('leadId', 'name lastName email phone');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: "error",
                message: "Buy opportunity not found"
            });
        }

        // Create activity for status update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'buy_opportunity_status_updated',
            content: `Buy opportunity status changed from "${currentOpportunity.status}" to "${status}" for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousStatus: currentOpportunity.status,
                newStatus: status,
                name: updatedOpportunity.name,
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

        const stats = await BuyOpportunity.aggregate([
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
                    totalBudget: {
                        $sum: { $add: ["$minBudget", "$maxBudget"] }
                    }
                }
            }
        ]);

        const stageStats = await BuyOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            status: "success",
            message: "Opportunity statistics fetched successfully",
            data: {
                overall: stats[0] || { total: 0, open: 0, won: 0, lost: 0, totalBudget: 0 },
                byStage: stageStats
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