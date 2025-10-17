// import InsuranceOpportunity from "../models/insuranceopportunityModel.js";

// // Create a new insurance opportunity
// export const createInsuranceOpportunity = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status,
//             stage,
//             currentInsuranceValidity,
//             documentsStatus,
//             insurerName,
//             costOfInsurance,
//             insuranceTerm,
//             insuranceType,
//             insuranceExpiryDate,
//             leadId
//         } = req.body;

//         // Validate required fields
//         if (!name || !owner || !stage || !currentInsuranceValidity || !leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Missing required fields: name, owner, stage, currentInsuranceValidity, leadId'
//             });
//         }

//         // Validate cost of insurance
//         if (costOfInsurance && costOfInsurance <= 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Cost of insurance must be greater than 0'
//             });
//         }

//         const insuranceOpportunity = new InsuranceOpportunity({
//             name,
//             email,
//             phoneNumber,
//             owner,
//             status: status || 'Open',
//             stage,
//             currentInsuranceValidity,
//             documentsStatus: documentsStatus || [],
//             insurerName,
//             costOfInsurance: costOfInsurance ? parseFloat(costOfInsurance) : undefined,
//             insuranceTerm,
//             insuranceType,
//             insuranceExpiryDate: insuranceExpiryDate || undefined,
//             leadId
//         });

//         await insuranceOpportunity.save();

//         // Populate the saved document
//         const populatedOpportunity = await InsuranceOpportunity.findById(insuranceOpportunity._id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant');

//         res.status(201).json({
//             status: 'success',
//             message: 'Insurance opportunity created successfully',
//             data: populatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error creating insurance opportunity:', error);
        
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

// // Get all insurance opportunities
// export const getAllInsuranceOpportunities = async (req, res) => {
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
//             currentInsuranceValidity
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
//                 { insurerName: { $regex: search, $options: 'i' } }
//             ];
//         }

//         if (status) filter.status = status;
//         if (stage) filter.stage = stage;
//         if (owner) filter.owner = owner;
//         if (currentInsuranceValidity) filter.currentInsuranceValidity = currentInsuranceValidity;

//         // Build sort object
//         const sort = {};
//         sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const opportunities = await InsuranceOpportunity.find(filter)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort(sort)
//             .skip(skip)
//             .limit(limitNum);

//         const total = await InsuranceOpportunity.countDocuments(filter);
//         const totalPages = Math.ceil(total / limitNum);

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunities fetched successfully',
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
//         console.error('Error fetching insurance opportunities:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch insurance opportunities',
//             error: error.message
//         });
//     }
// };

// // Get insurance opportunity by ID
// export const getInsuranceOpportunityById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const opportunity = await InsuranceOpportunity.findById(id)
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant');

//         if (!opportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Insurance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunity fetched successfully',
//             data: opportunity
//         });
//     } catch (error) {
//         console.error('Error fetching insurance opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch insurance opportunity',
//             error: error.message
//         });
//     }
// };

// // Update insurance opportunity
// export const updateInsuranceOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         // Validate cost of insurance if provided
//         if (updateData.costOfInsurance && updateData.costOfInsurance <= 0) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Cost of insurance must be greater than 0'
//             });
//         }

//         // Remove immutable fields
//         delete updateData._id;
//         delete updateData.createdAt;
//         delete updateData.updatedAt;

//         // Convert costOfInsurance to number if provided
//         if (updateData.costOfInsurance) {
//             updateData.costOfInsurance = parseFloat(updateData.costOfInsurance);
//         }

//         const updatedOpportunity = await InsuranceOpportunity.findByIdAndUpdate(
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
//                 message: 'Insurance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunity updated successfully',
//             data: updatedOpportunity
//         });
//     } catch (error) {
//         console.error('Error updating insurance opportunity:', error);
        
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
//             message: 'Failed to update insurance opportunity',
//             error: error.message
//         });
//     }
// };

// // Delete insurance opportunity
// export const deleteInsuranceOpportunity = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Opportunity ID is required'
//             });
//         }

//         const deletedOpportunity = await InsuranceOpportunity.findByIdAndDelete(id);

//         if (!deletedOpportunity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Insurance opportunity not found'
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunity deleted successfully',
//             data: {
//                 id: deletedOpportunity._id,
//                 name: deletedOpportunity.name
//             }
//         });
//     } catch (error) {
//         console.error('Error deleting insurance opportunity:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid opportunity ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to delete insurance opportunity',
//             error: error.message
//         });
//     }
// };

// // Get insurance opportunities by lead ID
// export const getInsuranceOpportunitiesByLeadId = async (req, res) => {
//     try {
//         const { leadId } = req.params;

//         if (!leadId) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Lead ID is required'
//             });
//         }

//         const opportunities = await InsuranceOpportunity.find({ leadId })
//             .populate('owner', 'username email')
//             .populate('leadId', 'name email phone carMake Model variant')
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunities fetched successfully',
//             data: opportunities
//         });
//     } catch (error) {
//         console.error('Error fetching insurance opportunities by lead ID:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid lead ID format'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch insurance opportunities',
//             error: error.message
//         });
//     }
// };

// // Get insurance opportunities statistics
// export const getInsuranceOpportunityStats = async (req, res) => {
//     try {
//         const stats = await InsuranceOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$status',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const total = await InsuranceOpportunity.countDocuments();
        
//         const stageStats = await InsuranceOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$stage',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         const validityStats = await InsuranceOpportunity.aggregate([
//             {
//                 $group: {
//                     _id: '$currentInsuranceValidity',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             status: 'success',
//             message: 'Insurance opportunity statistics fetched successfully',
//             data: {
//                 total,
//                 statusStats: stats,
//                 stageStats,
//                 validityStats
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching insurance opportunity statistics:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch insurance opportunity statistics',
//             error: error.message
//         });
//     }
// };



import InsuranceOpportunity from "../models/insuranceopportunityModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Create a new insurance opportunity
export const createInsuranceOpportunity = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            owner,
            status,
            stage,
            currentInsuranceValidity,
            documentsStatus,
            insurerName,
            costOfInsurance,
            insuranceTerm,
            insuranceType,
            insuranceExpiryDate,
            leadId
        } = req.body;

        // Validate required fields
        if (!name || !owner || !stage || !currentInsuranceValidity || !leadId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, owner, stage, currentInsuranceValidity, leadId'
            });
        }

        // Validate cost of insurance
        if (costOfInsurance && costOfInsurance <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cost of insurance must be greater than 0'
            });
        }

        const insuranceOpportunity = new InsuranceOpportunity({
            name,
            email,
            phoneNumber,
            owner,
            status: status || 'Open',
            stage,
            currentInsuranceValidity,
            documentsStatus: documentsStatus || [],
            insurerName,
            costOfInsurance: costOfInsurance ? parseFloat(costOfInsurance) : undefined,
            insuranceTerm,
            insuranceType,
            insuranceExpiryDate: insuranceExpiryDate || undefined,
            leadId
        });

        await insuranceOpportunity.save();

        // Populate the saved document
        const populatedOpportunity = await InsuranceOpportunity.findById(insuranceOpportunity._id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant');

        // Create activity for opportunity creation
        const activity = new Activity({
            user: owner,
            type: 'insurance_opportunity_created',
            content: `Insurance opportunity created for "${name}"`,
            contentId: insuranceOpportunity._id,
            metadata: {
                name,
                email,
                phoneNumber,
                owner,
                status: status || 'Open',
                stage,
                currentInsuranceValidity,
                insurerName,
                costOfInsurance: costOfInsurance ? parseFloat(costOfInsurance) : undefined,
                insuranceTerm,
                insuranceType,
                leadId
            }
        });

        await activity.save();

        res.status(201).json({
            status: 'success',
            message: 'Insurance opportunity created successfully',
            data: populatedOpportunity
        });
    } catch (error) {
        console.error('Error creating insurance opportunity:', error);
        
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

// Get all insurance opportunities
export const getAllInsuranceOpportunities = async (req, res) => {
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
            currentInsuranceValidity
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
                { insurerName: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (stage) filter.stage = stage;
        if (owner) filter.owner = owner;
        if (currentInsuranceValidity) filter.currentInsuranceValidity = currentInsuranceValidity;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const opportunities = await InsuranceOpportunity.find(filter)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await InsuranceOpportunity.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunities fetched successfully',
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
        console.error('Error fetching insurance opportunities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurance opportunities',
            error: error.message
        });
    }
};

// Get insurance opportunity by ID
export const getInsuranceOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const opportunity = await InsuranceOpportunity.findById(id)
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant');

        if (!opportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance opportunity not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunity fetched successfully',
            data: opportunity
        });
    } catch (error) {
        console.error('Error fetching insurance opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurance opportunity',
            error: error.message
        });
    }
};

// Update insurance opportunity
export const updateInsuranceOpportunity = async (req, res) => {
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
        const currentOpportunity = await InsuranceOpportunity.findById(id);
        if (!currentOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance opportunity not found'
            });
        }

        // Validate cost of insurance if provided
        if (updateData.costOfInsurance && updateData.costOfInsurance <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cost of insurance must be greater than 0'
            });
        }

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Convert costOfInsurance to number if provided
        if (updateData.costOfInsurance) {
            updateData.costOfInsurance = parseFloat(updateData.costOfInsurance);
        }

        const updatedOpportunity = await InsuranceOpportunity.findByIdAndUpdate(
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
                message: 'Insurance opportunity not found'
            });
        }

        // Create activity for opportunity update
        const activity = new Activity({
            user: req.user?._id || updatedOpportunity.owner,
            type: 'insurance_opportunity_updated',
            content: `Insurance opportunity updated for "${updatedOpportunity.name}"`,
            contentId: updatedOpportunity._id,
            metadata: {
                previousData: {
                    name: currentOpportunity.name,
                    status: currentOpportunity.status,
                    stage: currentOpportunity.stage,
                    currentInsuranceValidity: currentOpportunity.currentInsuranceValidity,
                    costOfInsurance: currentOpportunity.costOfInsurance
                },
                updatedData: {
                    name: updatedOpportunity.name,
                    status: updatedOpportunity.status,
                    stage: updatedOpportunity.stage,
                    currentInsuranceValidity: updatedOpportunity.currentInsuranceValidity,
                    costOfInsurance: updatedOpportunity.costOfInsurance
                },
                changes: Object.keys(updateData)
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunity updated successfully',
            data: updatedOpportunity
        });
    } catch (error) {
        console.error('Error updating insurance opportunity:', error);
        
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
            message: 'Failed to update insurance opportunity',
            error: error.message
        });
    }
};

// Delete insurance opportunity
export const deleteInsuranceOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        const deletedOpportunity = await InsuranceOpportunity.findByIdAndDelete(id);

        if (!deletedOpportunity) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance opportunity not found'
            });
        }

        // Create activity for opportunity deletion
        const activity = new Activity({
            user: req.user?._id || deletedOpportunity.owner,
            type: 'insurance_opportunity_deleted',
            content: `Insurance opportunity deleted for "${deletedOpportunity.name}"`,
            contentId: deletedOpportunity._id,
            metadata: {
                name: deletedOpportunity.name,
                email: deletedOpportunity.email,
                phoneNumber: deletedOpportunity.phoneNumber,
                status: deletedOpportunity.status,
                stage: deletedOpportunity.stage,
                currentInsuranceValidity: deletedOpportunity.currentInsuranceValidity,
                insurerName: deletedOpportunity.insurerName,
                leadId: deletedOpportunity.leadId
            }
        });

        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunity deleted successfully',
            data: {
                id: deletedOpportunity._id,
                name: deletedOpportunity.name
            }
        });
    } catch (error) {
        console.error('Error deleting insurance opportunity:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid opportunity ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete insurance opportunity',
            error: error.message
        });
    }
};

// Get insurance opportunities by lead ID
export const getInsuranceOpportunitiesByLeadId = async (req, res) => {
    try {
        const { leadId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        const opportunities = await InsuranceOpportunity.find({ leadId })
            .populate('owner', 'username email')
            .populate('leadId', 'name email phone carMake Model variant')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunities fetched successfully',
            data: opportunities
        });
    } catch (error) {
        console.error('Error fetching insurance opportunities by lead ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid lead ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurance opportunities',
            error: error.message
        });
    }
};

// Get insurance opportunities statistics
export const getInsuranceOpportunityStats = async (req, res) => {
    try {
        const stats = await InsuranceOpportunity.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await InsuranceOpportunity.countDocuments();
        
        const stageStats = await InsuranceOpportunity.aggregate([
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 }
                }
            }
        ]);

        const validityStats = await InsuranceOpportunity.aggregate([
            {
                $group: {
                    _id: '$currentInsuranceValidity',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Insurance opportunity statistics fetched successfully',
            data: {
                total,
                statusStats: stats,
                stageStats,
                validityStats
            }
        });
    } catch (error) {
        console.error('Error fetching insurance opportunity statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurance opportunity statistics',
            error: error.message
        });
    }
};