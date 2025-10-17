// controllers/leadController.js
import LeadModel from "../models/leadModel.js";
import leadAssignmentService from "../services/leadAssignmentService.js";
import Activity from "../models/activityModel.js";
import User from "../models/userModel.js";

export const addLead = async (req, res) => {
  try {
    const {
      name,
      lastName = '',
      email = '',
      phone,
      mobile = '',
      profileImage = null,
      jobTitle = '',
      company = '',
      address = '',
      city = '',
      cityName = '',
      state = '',
      stateName = '',
      zip = '',
      country = '',
      leadSource = '',
      twitter = '',
      facebook = '',
      linkedin = '',
      skype = '',
      gtalk = '',
      googlePlus = '',
      callCount = 0,
      carMake = '',
      Model,
      variant = '',
      status = 'New Lead',
      assignedTo,
    } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        status: "error",
        message: "Name and phone are required fields"
      });
    }

    // Check if lead with same phone already exists
    const existingLead = await LeadModel.findOne({ phone });
    let finalAssignedTo = assignedTo;

    if (existingLead) {
      const userExist = await User.findById(existingLead.assignedTo);
      
      if (userExist && userExist.status === 'Active' && userExist.role === 'Sales Executive') {
        finalAssignedTo = existingLead.assignedTo;
      }
      // If user doesn't exist or is not active, continue with normal assignment process
    }

    let assignedUserId = finalAssignedTo;
    let assignmentMethod = 'manual';

    // If no assignedTo is provided, use automatic round-robin assignment
    if (!assignedUserId) {
      try {
        assignedUserId = await leadAssignmentService.assignLeadRoundRobin();
        assignmentMethod = 'automatic';
        
        const assignmentState = leadAssignmentService.getAssignmentState();
        console.log(`Lead automatically assigned via round-robin. Method: ${assignmentMethod}, Current index: ${assignmentState.currentIndex}`);
      } catch (assignmentError) {
        console.warn('Auto-assignment failed, creating lead without assignment:', assignmentError.message);
        // Continue without assignment if no sales executives are available
        assignedUserId = null;
        assignmentMethod = 'none';
      }
    }

    // Create lead object
    const leadData = {
      name,
      lastName,
      email,
      phone,
      mobile,
      profileImage,
      jobTitle,
      company,
      address,
      city,
      state,
      cityName,
      stateName,
      zip,
      country,
      leadSource,
      twitter,
      facebook,
      linkedin,
      skype,
      gtalk,
      googlePlus,
      callCount,
      carMake,
      Model, // Fixed: removed extra comma
      variant,
      status,
      assignedTo: assignedUserId,
    };

    const newLead = new LeadModel(leadData);
    const savedLead = await newLead.save();

    // Get assigned user details for activity log
    const assignedUser = assignedUserId ? await User.findById(assignedUserId) : null;

    console.log(`Lead created with ID: ${savedLead._id}, Assigned To: ${assignedUser ? assignedUser.username : 'Unassigned'}, Assignment Method: ${assignmentMethod}`);

    // Create activity log
    const activity = new Activity({
      user: assignedUserId || null,
      type: 'lead_created',
      content: `New lead "${name}" created and ${assignedUserId ? `assigned to ${assignedUser?.username || 'user'}` : 'not assigned'}`,
      contentId: savedLead._id,
      metadata: leadData
    });

    await activity.save();

    // Populate the lead data before sending response
    const populatedLead = await LeadModel.findById(savedLead._id)
      .populate('assignedTo', 'username email name role')
      .exec();

    res.status(201).json({
      status: "success",
      message: "Lead created successfully",
      data: populatedLead,
      assignment: {
        method: assignmentMethod,
        assignedTo: assignedUserId
      }
    });

  } catch (error) {
    console.error('Error creating lead:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Lead with this phone number already exists"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get leads with pagination - FIXED VERSION
export const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search = '', filters = {} } = req.body;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      query.assignedTo = filters.assignedTo;
    }
    
    if (filters.source && filters.source !== 'all') {
      query.leadSource = filters.source;
    }

    // Date range filters
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          query.createdAt = { $gte: startDate };
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          query.createdAt = { $gte: startDate };
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          query.createdAt = { $gte: startDate };
          break;
        case 'custom':
          if (filters.dateFrom && filters.dateTo) {
            const fromDate = new Date(filters.dateFrom);
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: fromDate, $lte: toDate };
          }
          break;
      }
    }

    const leads = await LeadModel.find(query)
      .populate('assignedTo', 'name email username')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await LeadModel.countDocuments(query);
    
    res.status(200).json({
      status: "success",
      data: {
        leads, 
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await LeadModel.findById(req.params.id).populate('assignedTo', 'name email username');
    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found"
      });
    }
    res.status(200).json({
      status: "success",
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If phone is being updated, check for duplicates excluding current lead
    // if (updateData.phone) {
    //   const existingLead = await LeadModel.findOne({ 
    //     phone: updateData.phone, 
    //     _id: { $ne: id } 
    //   });
    //   if (existingLead) {
    //     return res.status(400).json({
    //       status: "error",
    //       message: "Lead with this phone number already exists"
    //     });
    //   }
    // }

    

    const updatedLead = await LeadModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email username');

    if (!updatedLead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found"
      });
    }

   

    await Activity.create({
      user: updatedLead.assignedTo,
      type: 'lead_updated',
      metadata: updateData,
      content: `Lead updated "${updatedLead.name} ${updatedLead.lastName}"`,
      contentId: updatedLead._id,
      metadata: updateData
    });

    res.status(200).json({
      status: "success",
      message: "Lead updated successfully",
      data: updatedLead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Lead with this phone number already exists"
      });
    }
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLead = await LeadModel.findByIdAndDelete(id);

    if (!deletedLead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
      data: deletedLead
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Export leads to CSV
export const exportLeads = async (req, res) => {
  try {
    const { type = 'all', filters = {} } = req.body;

    let query = {};

    // Apply filters based on export type
    if (type === 'active') {
      query.status = { 
        $nin: ['Junk Lead', 'Not Interested', 'Closed', 'Sold'] 
      };
    } else if (type === 'filtered') {
      // Apply the same filters as in getLeads
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        query.assignedTo = filters.assignedTo;
      }
      
      if (filters.source && filters.source !== 'all') {
        query.leadSource = filters.source;
      }
    }

    const leads = await LeadModel.find(query)
      .populate('assignedTo', 'name email username')
      .sort('-createdAt');

    if (leads.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No leads found to export"
      });
    }

    res.status(200).json({
      status: "success",
      data: leads,
      count: leads.length
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};