// import RtoOpportunity from "../models/rtoopportunityModel.js";

// // Create a new RTO opportunity
// export const createRtoOpportunity = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status,
//             stage,
//             processToBeDone,
//             transferType,
//             documentsPending,
//             rtoStatus,
//             expectedDateOfTransfer,
//             newRegNumber,
//             newRcCardStatus,
//             leadId
//         } = req.body;

//         // Validate required fields
//         if (!name || !owner || !stage || !processToBeDone || !leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Missing required fields: name, owner, stage, processToBeDone, leadId'
//             });
//         }

//         const rtoOpportunity = new RtoOpportunity({
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status: status || 'Open',
//             stage,
//             processToBeDone,
//             transferType,
//             documentsPending: documentsPending || [],
//             rtoStatus,
//             expectedDateOfTransfer: expectedDateOfTransfer || undefined,
//             newRegNumber,
//             newRcCardStatus,
//             leadId
//         });

//         await rtoOpportunity.save();

//         // Populate the saved document
//         const populatedOpportunity = await RtoOpportunity.findById(rtoOpportunity._id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant');

//         res.status(201).json({
//             status: 'success',
//             message: 'RTO opportunity created successfully',
//             data: populatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error creating RTO opportunity:', error);
        
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

// // Get all RTO opportunities
// export const getAllRtoOpportunities = async (req, res) => {
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
//             processToBeDone,
//             rtoStatus
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
//                 { newRegNumber: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;
//         if (owner) filter.owner = owner;
//         if (processToBeDone) filter.processToBeDone = processToBeDone;
//         if (rtoStatus) filter.rtoStatus = rtoStatus;

//         // Build sort object
//         const sort = {};
//         sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const opportunities = await RtoOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort(sort)
//             .skip(skip)
//             .limit(limitNum);

//         const total = await RtoOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunities fetched successfully',
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
//         console.error('Error fetching RTO opportunities:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunities',
//             error: error.message
//         });
//     }
// };

// // Get RTO opportunity by ID
// export const getRtoOpportunityById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const opportunity = await RtoOpportunity.findById(id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant');

//         if (!opportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'RTO opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunity fetched successfully',
//             data: opportunity
//         });
//     } catch (error) {
//         console.error('Error fetching RTO opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunity',
//             error: error.message
//         });
//     }
// };

// // Update RTO opportunity
// export const updateRtoOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         // Remove immutable fields
//         delete updateData._id;
//         delete updateData.createdAt;
//         delete updateData.updatedAt;

//         const updatedOpportunity = await RtoOpportunity.findByIdAndUpdate(
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
//                 message: 'RTO opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunity updated successfully',
//             data: updatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error updating RTO opportunity:', error);
        
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
//             message: 'Failed to update RTO opportunity',
//             error: error.message
//         });
//     }
// };

// // Delete RTO opportunity
// export const deleteRtoOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const deletedOpportunity = await RtoOpportunity.findByIdAndDelete(id);

//         if (!deletedOpportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'RTO opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunity deleted successfully',
//             data: {
//                 id: deletedOpportunity._id,
//                 name: deletedOpportunity.name
//             }
//         });
//     } catch (error) {
//         console.error('Error deleting RTO opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to delete RTO opportunity',
//             error: error.message
//         });
//     }
// };

// // Get RTO opportunities by lead ID
// export const getRtoOpportunitiesByLeadId = async (req, res) => {
//     try {
//         const { leadId } = req.params;

//         if (!leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Lead ID is required'
//             });
//         }

//         const opportunities = await RtoOpportunity.find({ leadId })
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunities fetched successfully',
//             data: opportunities
//         });
//     } catch (error) {
//         console.error('Error fetching RTO opportunities by lead ID:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid lead ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunities',
//             error: error.message
//         });
//     }
// };

// // Get RTO opportunities statistics
// export const getRtoOpportunityStats = async (req, res) => {
//     try {
//         const stats = await RtoOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$status',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const total = await RtoOpportunity.countDocuments();
        
//         const stageStats = await RtoOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$stage',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const processStats = await RtoOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$processToBeDone',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const rtoStatusStats = await RtoOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$rtoStatus',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunity statistics fetched successfully',
//             data: {
//                 total,
//                 statusStats: stats,
//                 stageStats,
//                 processStats,
//                 rtoStatusStats
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching RTO opportunity statistics:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunity statistics',
//             error: error.message
//         });
//     }
// };

// // Get RTO opportunities by process type
// export const getRtoOpportunitiesByProcess = async (req, res) => {
//     try {
//         const { processType } = req.params;

//         if (!processType) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Process type is required'
//             });
//         }

//         const opportunities = await RtoOpportunity.find({ processToBeDone: processType })
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunities fetched successfully',
//             data: opportunities
//         });
//     } catch (error) {
//         console.error('Error fetching RTO opportunities by process type:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunities',
//             error: error.message
//         });
//     }
// };

// // Get RTO opportunities count by status
// export const getRtoOpportunityCounts = async (req, res) => {
//     try {
//         const openCount = await RtoOpportunity.countDocuments({ status: 'Open' });
//         const wonCount = await RtoOpportunity.countDocuments({ status: 'Won' });
//         const lostCount = await RtoOpportunity.countDocuments({ status: 'Lost' });

//         res.status(200).json({
//             status: 'success',
//             message: 'RTO opportunity counts fetched successfully',
//             data: {
//                 open: openCount,
//                 won: wonCount,
//                 lost: lostCount,
//                 total: openCount + wonCount + lostCount
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching RTO opportunity counts:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch RTO opportunity counts',
//             error: error.message
//         });
//     }
// };




import RtoOpportunity from "../models/rtoopportunityModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Create a new RTO opportunity
export const createRtoOpportunity = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            owner,
            status,
            stage,
            processToBeDone,
            transferType,
            documentsPending,
            rtoStatus,
            expectedDateOfTransfer,
            newRegNumber,
            newRcCardStatus,
            leadId
        } = req.body;

        // Validate required fields
        if (!name || !owner || !stage || !processToBeDone || !leadId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, owner, stage, processToBeDone, leadId'
            });
        }

        const rtoOpportunity = new RtoOpportunity({
            name,
            email,
            phoneNumber,
            owner,
            status: status || 'Open',
            stage,
            processToBeDone,
            transferType,
            documentsPending: documentsPending || [],
            rtoStatus,
            expectedDateOfTransfer: expectedDateOfTransfer || undefined,
            newRegNumber,
            newRcCardStatus,
            leadId
        });

        await rtoOpportunity.save();

        // Populate the saved document
        const populatedOpportunity = await RtoOpportunity.findById(rtoOpportunity._id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant');

        // Create activity for opportunity creation
        const activity = new Activity({
            user: owner,
            type: 'rto_opportunity_created',
            content: `RTO opportunity created for "${name}"`,
            contentId: rtoOpportunity._id,
            metadata: {
                name,
                email,
                phoneNumber,
                owner,
                status: status || 'Open',
                stage,
                processToBeDone,
                transferType,
                rtoStatus,
                expectedDateOfTransfer: expectedDateOfTransfer || undefined,
                newRegNumber,
                newRcCardStatus,
                leadId
            }
        });

        await activity.save();

        res.status(201).json({
            status: 'success',
            message: 'RTO opportunity created successfully',
            data: populatedOpportunity
        });
    } catch (error) {
        console.error('Error creating RTO opportunity:', error);
        
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

// Get all RTO opportunities
export const getAllRtoOpportunities = async (req, res) => {
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
            processToBeDone,
            rtoStatus
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
                { newRegNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (owner) filter.owner = owner;
        if (processToBeDone) filter.processToBeDone = processToBeDone;
        if (rtoStatus) filter.rtoStatus = rtoStatus;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const opportunities = await RtoOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await RtoOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunities fetched successfully',
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
        console.error('Error fetching RTO opportunities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunities',
            error: error.message
        });
    }
};

// Get RTO opportunity by ID
export const getRtoOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const opportunity = await RtoOpportunity.findById(id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant');

        if (!opportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'RTO opportunity not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunity fetched successfully',
            data: opportunity
        });
    } catch (error) {
        console.error('Error fetching RTO opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunity',
            error: error.message
        });
    }
};

// Update RTO opportunity
export const updateRtoOpportunity = async (req, res) => {
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
        const currentOpportunity = await RtoOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'RTO opportunity not found'
            });
        }

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedOpportunity = await RtoOpportunity.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        )
        .populate('owner', 'username email')
        .populate('leadId', 'name email phone carMake Model variant');

        if (!updatedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'RTO opportunity not found'
            });
        }

        // Create activity for opportunity update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'rto_opportunity_updated',
            content: `RTO opportunity updated for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousData: {
                    name: currentOpportunity.name,
                    status: currentOpportunity.status,
                    stage: currentOpportunity.stage,
                    processToBeDone: currentOpportunity.processToBeDone,
                    rtoStatus: currentOpportunity.rtoStatus
                },
                updatedData: {
                    name: updatedOpportunity.name,
                    status: updatedOpportunity.status,
                    stage: updatedOpportunity.stage,
                    processToBeDone: updatedOpportunity.processToBeDone,
                    rtoStatus: updatedOpportunity.rtoStatus
                },
                changes: Object.keys(updateData)
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunity updated successfully',
            data: updatedOpportunity
        });
    } catch (error) {
        console.error('Error updating RTO opportunity:', error);
        
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
            message: 'Failed to update RTO opportunity',
            error: error.message
        });
    }
};

// Delete RTO opportunity
export const deleteRtoOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const deletedOpportunity = await RtoOpportunity.findByIdAndDelete(id);

        if (!deletedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'RTO opportunity not found'
            });
        }

        // Create activity for opportunity deletion
        const activity = new Activity({
            user: req.user?._id || deletedOpportunity.owner,
            type: 'rto_opportunity_deleted',
            content: `RTO opportunity deleted for "${deletedOpportunity.name}"`,
            contentId: deletedOpportunity._id,
            metadata: {
                name: deletedOpportunity.name,
                email: deletedOpportunity.email,
                phoneNumber: deletedOpportunity.phoneNumber,
                status: deletedOpportunity.status,
                stage: deletedOpportunity.stage,
                processToBeDone: deletedOpportunity.processToBeDone,
                rtoStatus: deletedOpportunity.rtoStatus,
                leadId: deletedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunity deleted successfully',
            data: {
                id: deletedOpportunity._id,
                name: deletedOpportunity.name
            }
        });
    } catch (error) {
        console.error('Error deleting RTO opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete RTO opportunity',
            error: error.message
        });
    }
};

// Get RTO opportunities by lead ID
export const getRtoOpportunitiesByLeadId = async (req, res) => {
    try {
        const { leadId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        const opportunities = await RtoOpportunity.find({ leadId })
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunities fetched successfully',
            data: opportunities
        });
    } catch (error) {
        console.error('Error fetching RTO opportunities by lead ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunities',
            error: error.message
        });
    }
};

// Get RTO opportunities statistics
export const getRtoOpportunityStats = async (req, res) => {
    try {
        const stats = await RtoOpportunity.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await RtoOpportunity.countDocuments();
        
        const stageStats = await RtoOpportunity.aggregate([
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 }
                }
            }
        ]);

        const processStats = await RtoOpportunity.aggregate([
            {
                $group: {
                    _id: '$processToBeDone',
                    count: { $sum: 1 }
                }
            }
        ]);

        const rtoStatusStats = await RtoOpportunity.aggregate([
            {
                $group: {
                    _id: '$rtoStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunity statistics fetched successfully',
            data: {
                total,
                statusStats: stats,
                stageStats,
                processStats,
                rtoStatusStats
            }
        });
    } catch (error) {
        console.error('Error fetching RTO opportunity statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunity statistics',
            error: error.message
        });
    }
};

// Get RTO opportunities by process type
export const getRtoOpportunitiesByProcess = async (req, res) => {
    try {
        const { processType } = req.params;

        if (!processType) {
            return res.status(400).json({
                status: 'error',
                message: 'Process type is required'
            });
        }

        const opportunities = await RtoOpportunity.find({ processToBeDone: processType })
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunities fetched successfully',
            data: opportunities
        });
    } catch (error) {
        console.error('Error fetching RTO opportunities by process type:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunities',
            error: error.message
        });
    }
};

// Get RTO opportunities count by status
export const getRtoOpportunityCounts = async (req, res) => {
    try {
        const openCount = await RtoOpportunity.countDocuments({ status: 'Open' });
        const wonCount = await RtoOpportunity.countDocuments({ status: 'Won' });
        const lostCount = await RtoOpportunity.countDocuments({ status: 'Lost' });

        res.status(200).json({
            status: 'success',
            message: 'RTO opportunity counts fetched successfully',
            data: {
                open: openCount,
                won: wonCount,
                lost: lostCount,
                total: openCount + wonCount + lostCount
            }
        });
    } catch (error) {
        console.error('Error fetching RTO opportunity counts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch RTO opportunity counts',
            error: error.message
        });
    }
};