import Activity from '../models/activityModel.js';
import mongoose from 'mongoose';

// Create a new activity
export const createActivity = async (req, res) => {
  try {
    const { user, type, content, contentId, metadata } = req.body;

    // Validate required fields
    if (!user || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'User, type, and content are required fields'
      });
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate contentId if provided
    if (contentId && !mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contentId format'
      });
    }

    const activity = new Activity({
      user,
      type,
      content,
      contentId: contentId || null,
      metadata: metadata || {}
    });

    const savedActivity = await activity.save();
    
    // Populate user details if needed
    await savedActivity.populate('user', 'username email name');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: savedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating activity',
      error: error.message
    });
  }
};

// Get all activities with pagination and filtering
// controllers/activityController.js - Updated getActivities function
export const getActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      user,
      type,
      leadId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      filter.user = user;
    }
    
    if (type) {
      filter.type = type;
    }

    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lead ID format'
        });
      }
      filter.leadId = leadId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const activities = await Activity.find(filter)
      .populate('user', 'username email name')
      .populate('leadId', 'name lastName email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
};

// Get activity by ID
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(id)
      .populate('user', 'username email name');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
};

// Get activities by user ID
export const getActivitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      type,
      startDate,
      endDate
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Build filter object
    const filter = { user: userId };
    
    if (type) {
      filter.type = type;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const activities = await Activity.find(filter)
      .populate('user', 'username email name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user activities',
      error: error.message
    });
  }
};

// Get activities by type
export const getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      user,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = { type };
    
    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      filter.user = user;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const activities = await Activity.find(filter)
      .populate('user', 'username email name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities by type',
      error: error.message
    });
  }
};

// Update activity
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    // Remove immutable fields
    delete updateData._id;
    delete updateData.user;
    delete updateData.createdAt;

    // Validate contentId if provided
    if (updateData.contentId && !mongoose.Types.ObjectId.isValid(updateData.contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contentId format'
      });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('user', 'username email name');

    if (!updatedActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating activity',
      error: error.message
    });
  }
};

// Delete activity
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const deletedActivity = await Activity.findByIdAndDelete(id);

    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      data: deletedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message
    });
  }
};

// Delete all activities for a user
export const deleteUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const result = await Activity.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} activities for user`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user activities',
      error: error.message
    });
  }
};

// Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    // Build match stage for aggregation
    const matchStage = {};
    
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      matchStage.user = new mongoose.Types.ObjectId(userId);
    }
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    const stats = await Activity.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latestActivity: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          latestActivity: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalActivities = await Activity.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      data: {
        totalActivities,
        activitiesByType: stats,
        summary: {
          totalTypes: stats.length,
          mostFrequentType: stats.length > 0 ? stats[0].type : null,
          mostFrequentCount: stats.length > 0 ? stats[0].count : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity statistics',
      error: error.message
    });
  }
};

// Search activities
export const searchActivities = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10,
      fields = ['content', 'type']
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search conditions
    const searchConditions = fields.map(field => ({
      [field]: { $regex: query, $options: 'i' }
    }));

    const activities = await Activity.find({
      $or: searchConditions
    })
      .populate('user', 'username email name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Activity.countDocuments({
      $or: searchConditions
    });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching activities',
      error: error.message
    });
  }
};