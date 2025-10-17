import LeadModel from "../models/leadModel.js";

// Upload lead profile image
export const uploadLeadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded"
      });
    }

    const fileUrl = `/uploads/leads/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      message: "Image uploaded successfully",
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading lead image:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload image"
    });
  }
};

// Update lead with profile image
export const updateLeadWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If there's a file uploaded, add it to update data
    if (req.file) {
      updateData.profileImage = `/uploads/leads/${req.file.filename}`;
    }

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

    res.status(200).json({
      status: "success",
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

// Add lead with profile image
export const addLeadWithImage = async (req, res) => {
  try {
    const {
      name,
      lastName = '',
      email = '',
      phone,
      mobile = '',
      jobTitle = '',
      company = '',
      address = '',
      city = '',
      state = '',
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
      Model = '',
      variant = '',
      status = 'New Lead',
      assignedTo,
    } = req.body;

    // Check if lead with same phone already exists
    const existingLead = await LeadModel.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({
        status: "error",
        message: "Lead with this phone number already exists"
      });
    }

    const leadData = {
      name,
      lastName,
      email,
      phone,
      mobile,
      jobTitle,
      company,
      address,
      city,
      state,
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
      Model,
      variant,
      status,
      assignedTo: assignedTo || null,
    };

    // If there's a file uploaded, add it to lead data
    if (req.file) {
      leadData.profileImage = `/uploads/leads/${req.file.filename}`;
    }

    const newLead = new LeadModel(leadData);
    const savedLead = await newLead.save();

    res.status(201).json({
      status: "success",
      data: savedLead
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

// Delete lead image
export const deleteLeadImage = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await LeadModel.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found"
      });
    }

    // Remove profile image
    lead.profileImage = null;
    await lead.save();

    res.status(200).json({
      status: "success",
      message: "Lead image deleted successfully",
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};