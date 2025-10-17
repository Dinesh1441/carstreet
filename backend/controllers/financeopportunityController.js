// import FinanceOpportunity from "../models/financeopportunityModel.js";

// // Create a new finance opportunity
// export const createFinanceOpportunity = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status,
//             stage,
//             loanAmount,
//             documentsPending,
//             loanType,
//             financeStatus,
//             banksAppliedTo,
//             approvedBank,
//             rateOfInterest,
//             periodOfRepayment,
//             loanNumber,
//             loanSanctioned,
//             leadId
//         } = req.body;

//         // Validate required fields
//         if (!name || !owner || !stage || !loanAmount || !loanType || !financeStatus || !leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Missing required fields: name, owner, stage, loanAmount, loanType, financeStatus, leadId'
//             });
//         }

//         // Validate loan amount
//         if (loanAmount <= 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Loan amount must be greater than 0'
//             });
//         }

//         const financeOpportunity = new FinanceOpportunity({
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status: status || 'Open',
//             stage,
//             loanAmount,
//             documentsPending,
//             loanType,
//             financeStatus,
//             banksAppliedTo: banksAppliedTo || [],
//             approvedBank,
//             rateOfInterest,
//             periodOfRepayment,
//             loanNumber,
//             loanSanctioned: loanSanctioned || false,
//             leadId
//         });

//         await financeOpportunity.save();

//         // Populate the saved document
//         const populatedOpportunity = await FinanceOpportunity.findById(financeOpportunity._id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone');

//         res.status(201).json({
//             status: 'success',
//             message: 'Finance opportunity created successfully',
//             data: populatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error creating finance opportunity:', error);
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Validation error',
//                 errors: errors
//             });
//         }

//         if (error.code === 11000) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Duplicate entry found'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Get all finance opportunities
// export const getAllFinanceOpportunities = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             sortBy = 'createdAt',
//             sortOrder = 'desc',
//             search,
//             status,
//             stage,
//             owner
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
//                 { loanNumber: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;
//         if (owner) filter.owner = owner;

//         // Build sort object
//         const sort = {};
//         sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const opportunities = await FinanceOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort(sort)
//             .skip(skip)
//             .limit(limitNum);

//         const total = await FinanceOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: 'success',
//             message: 'Finance opportunities fetched successfully',
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
//         console.error('Error fetching finance opportunities:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch finance opportunities',
//             error: error.message
//         });
//     }
// };

// // Get finance opportunity by ID
// export const getFinanceOpportunityById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const opportunity = await FinanceOpportunity.findById(id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant');

//         if (!opportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Finance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Finance opportunity fetched successfully',
//             data: opportunity
//         });
//     } catch (error) {
//         console.error('Error fetching finance opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch finance opportunity',
//             error: error.message
//         });
//     }
// };

// // Update finance opportunity
// export const updateFinanceOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         // Validate loan amount if provided
//         if (updateData.loanAmount && updateData.loanAmount <= 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Loan amount must be greater than 0'
//             });
//         }

//         // Remove immutable fields
//         delete updateData._id;
//         delete updateData.createdAt;
//         delete updateData.updatedAt;

//         const updatedOpportunity = await FinanceOpportunity.findByIdAndUpdate(
//             id,
//             { $set: updateData },
//             { 
//                 new: true, 
//                 runValidators: true,
//                 context: 'query'
//             }
//         )
//         .populate('owner', 'username email')
//         .populate('leadId', 'name email phone carMake Model variant');

//         if (!updatedOpportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Finance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Finance opportunity updated successfully',
//             data: updatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error updating finance opportunity:', error);
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Validation error',
//                 errors: errors
//             });
//         }

//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to update finance opportunity',
//             error: error.message
//         });
//     }
// };

// // Delete finance opportunity
// export const deleteFinanceOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const deletedOpportunity = await FinanceOpportunity.findByIdAndDelete(id);

//         if (!deletedOpportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Finance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Finance opportunity deleted successfully',
//             data: {
//                 id: deletedOpportunity._id,
//                 name: deletedOpportunity.name
//             }
//         });
//     } catch (error) {
//         console.error('Error deleting finance opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to delete finance opportunity',
//             error: error.message
//         });
//     }
// };

// // Get finance opportunities by lead ID
// export const getFinanceOpportunitiesByLeadId = async (req, res) => {
//     try {
//         const { leadId } = req.params;

//         if (!leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Lead ID is required'
//             });
//         }

//         const opportunities = await FinanceOpportunity.find({ leadId })
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             status: 'success',
//             message: 'Finance opportunities fetched successfully',
//             data: opportunities
//         });
//     } catch (error) {
//         console.error('Error fetching finance opportunities by lead ID:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid lead ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch finance opportunities',
//             error: error.message
//         });
//     }
// };



import FinanceOpportunity from "../models/financeopportunityModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Create a new finance opportunity
export const createFinanceOpportunity = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            owner,
            status,
            stage,
            loanAmount,
            documentsPending,
            loanType,
            financeStatus,
            banksAppliedTo,
            approvedBank,
            rateOfInterest,
            periodOfRepayment,
            loanNumber,
            loanSanctioned,
            leadId
        } = req.body;

        // Validate required fields
        if (!name || !owner || !stage || !loanAmount || !loanType || !financeStatus || !leadId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, owner, stage, loanAmount, loanType, financeStatus, leadId'
            });
        }

        // Validate loan amount
        if (loanAmount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Loan amount must be greater than 0'
            });
        }

        const financeOpportunity = new FinanceOpportunity({
            name,
            email,
            phoneNumber,
            owner,
            status: status || 'Open',
            stage,
            loanAmount,
            documentsPending,
            loanType,
            financeStatus,
            banksAppliedTo: banksAppliedTo || [],
            approvedBank,
            rateOfInterest,
            periodOfRepayment,
            loanNumber,
            loanSanctioned: loanSanctioned || false,
            leadId
        });

        await financeOpportunity.save();

        // Populate the saved document
        const populatedOpportunity = await FinanceOpportunity.findById(financeOpportunity._id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone');

        // Create activity for opportunity creation
        const activity = new Activity({
            user: owner,
            type: 'finance_opportunity_created',
            content: `Finance opportunity created for "${name}"`,
            contentId: financeOpportunity._id,
            metadata: {
                name,
                email,
                phoneNumber,
                owner,
                status: status || 'Open',
                stage,
                loanAmount,
                loanType,
                financeStatus,
                banksAppliedTo: banksAppliedTo || [],
                approvedBank,
                rateOfInterest,
                periodOfRepayment,
                loanNumber,
                loanSanctioned: loanSanctioned || false,
                leadId
            }
        });

        await activity.save();

        res.status(201).json({
            status: 'success',
            message: 'Finance opportunity created successfully',
            data: populatedOpportunity
        });
    } catch (error) {
        console.error('Error creating finance opportunity:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Duplicate entry found'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all finance opportunities
export const getAllFinanceOpportunities = async (req, res) => {
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
            financeStatus,
            loanType,
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
                { loanNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (owner) filter.owner = owner;
        if (financeStatus) filter.financeStatus = financeStatus;
        if (loanType) filter.loanType = loanType;

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const opportunities = await FinanceOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake model variant')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await FinanceOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunities fetched successfully',
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
        console.error('Error fetching finance opportunities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch finance opportunities',
            error: error.message
        });
    }
};

// Get finance opportunity by ID
export const getFinanceOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const opportunity = await FinanceOpportunity.findById(id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake model variant');

        if (!opportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunity fetched successfully',
            data: opportunity
        });
    } catch (error) {
        console.error('Error fetching finance opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch finance opportunity',
            error: error.message
        });
    }
};

// Update finance opportunity
export const updateFinanceOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        // Get the current opportunity data before update
        const currentOpportunity = await FinanceOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        // Validate loan amount if provided
        if (updateData.loanAmount && updateData.loanAmount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Loan amount must be greater than 0'
            });
        }

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedOpportunity = await FinanceOpportunity.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        )
        .populate('owner', 'username email')
        .populate('leadId', 'name email phone carMake model variant');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        // Create activity for opportunity update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'finance_opportunity_updated',
            content: `Finance opportunity updated for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousData: {
                    name: currentOpportunity.name,
                    status: currentOpportunity.status,
                    stage: currentOpportunity.stage,
                    financeStatus: currentOpportunity.financeStatus,
                    loanAmount: currentOpportunity.loanAmount
                },
                updatedData: {
                    name: updatedOpportunity.name,
                    status: updatedOpportunity.status,
                    stage: updatedOpportunity.stage,
                    financeStatus: updatedOpportunity.financeStatus,
                    loanAmount: updatedOpportunity.loanAmount
                },
                changes: Object.keys(updateData)
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunity updated successfully',
            data: updatedOpportunity
        });
    } catch (error) {
        console.error('Error updating finance opportunity:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to update finance opportunity',
            error: error.message
        });
    }
};

// Delete finance opportunity
export const deleteFinanceOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const deletedOpportunity = await FinanceOpportunity.findByIdAndDelete(id);

        if (!deletedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        // Create activity for opportunity deletion
        const activity = new Activity({
            user: req.user?._id || deletedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'finance_opportunity_deleted',
            content: `Finance opportunity deleted for "${deletedOpportunity.name}"`,
            contentId: deletedOpportunity._id,
            metadata: {
                name: deletedOpportunity.name,
                email: deletedOpportunity.email,
                phoneNumber: deletedOpportunity.phoneNumber,
                status: deletedOpportunity.status,
                stage: deletedOpportunity.stage,
                financeStatus: deletedOpportunity.financeStatus,
                loanAmount: deletedOpportunity.loanAmount,
                leadId: deletedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunity deleted successfully',
            data: {
                id: deletedOpportunity._id,
                name: deletedOpportunity.name
            }
        });
    } catch (error) {
        console.error('Error deleting finance opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete finance opportunity',
            error: error.message
        });
    }
};

// Get finance opportunities by lead ID
export const getFinanceOpportunitiesByLeadId = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const opportunities = await FinanceOpportunity.find({ leadId })
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake model variant')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await FinanceOpportunity.countDocuments({ leadId });
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunities fetched successfully',
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
        console.error('Error fetching finance opportunities by lead ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch finance opportunities',
            error: error.message
        });
    }
};

// Get finance opportunities by owner
export const getFinanceOpportunitiesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status, stage, financeStatus, page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid owner ID format'
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const filter = { owner: ownerId };
        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (financeStatus) filter.financeStatus = financeStatus;

        const opportunities = await FinanceOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake model variant')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await FinanceOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunities fetched successfully',
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
        console.error('Error fetching finance opportunities by owner:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid owner ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch finance opportunities',
            error: error.message
        });
    }
};

// Update finance opportunity status
export const updateFinanceOpportunityStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        if (!status || !['Open', 'Won', 'Lost'].includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid status is required (Open, Won, Lost)'
            });
        }

        // Get current opportunity before update
        const currentOpportunity = await FinanceOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        const updatedOpportunity = await FinanceOpportunity.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        .populate('owner', 'username email')
        .populate('leadId', 'name email phone carMake model variant');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        // Create activity for status update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner, // Use logged-in user or opportunity owner
            type: 'finance_opportunity_status_updated',
            content: `Finance opportunity status changed from "${currentOpportunity.status}" to "${status}" for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousStatus: currentOpportunity.status,
                newStatus: status,
                name: updatedOpportunity.name,
                leadId: updatedOpportunity.leadId,
                loanAmount: updatedOpportunity.loanAmount
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunity status updated successfully',
            data: updatedOpportunity
        });

    } catch (error) {
        console.error('Error updating finance opportunity status:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to update finance opportunity status',
            error: error.message
        });
    }
};

// Update finance status
export const updateFinanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { financeStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        if (!financeStatus) {
            return res.status(400).json({
                status: 'error',
                message: 'Finance status is required'
            });
        }

        // Get current opportunity before update
        const currentOpportunity = await FinanceOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        const updatedOpportunity = await FinanceOpportunity.findByIdAndUpdate(
            id,
            { financeStatus },
            { new: true }
        )
        .populate('owner', 'username email')
        .populate('leadId', 'name email phone carMake model variant');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Finance opportunity not found'
            });
        }

        // Create activity for finance status update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'finance_status_updated',
            content: `Finance status changed from "${currentOpportunity.financeStatus}" to "${financeStatus}" for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousFinanceStatus: currentOpportunity.financeStatus,
                newFinanceStatus: financeStatus,
                name: updatedOpportunity.name,
                leadId: updatedOpportunity.leadId,
                loanAmount: updatedOpportunity.loanAmount
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Finance status updated successfully',
            data: updatedOpportunity
        });

    } catch (error) {
        console.error('Error updating finance status:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to update finance status',
            error: error.message
        });
    }
};

// Get finance opportunity statistics
export const getFinanceOpportunityStats = async (req, res) => {
    try {
        const { ownerId, startDate, endDate } = req.query;

        const filter = {};
        if (ownerId) filter.owner = ownerId;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const stats = await FinanceOpportunity.aggregate([
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
                    totalLoanAmount: { $sum: "$loanAmount" },
                    averageLoanAmount: { $avg: "$loanAmount" }
                }
            }
        ]);

        const stageStats = await FinanceOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 },
                    totalLoanAmount: { $sum: "$loanAmount" }
                }
            }
        ]);

        const financeStatusStats = await FinanceOpportunity.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$financeStatus",
                    count: { $sum: 1 },
                    totalLoanAmount: { $sum: "$loanAmount" }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Finance opportunity statistics fetched successfully',
            data: {
                overall: stats[0] || { 
                    total: 0, 
                    open: 0, 
                    won: 0, 
                    lost: 0, 
                    totalLoanAmount: 0, 
                    averageLoanAmount: 0 
                },
                byStage: stageStats,
                byFinanceStatus: financeStatusStats
            }
        });

    } catch (error) {
        console.error('Error fetching finance opportunity statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch finance opportunity statistics',
            error: error.message
        });
    }
};