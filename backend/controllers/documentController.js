// import Document from '../models/documentModel.js';
// import { deleteUploadedFile } from '../middleware/multer.js';
// import fs from 'fs';
// import path from 'path';

// // Upload document using multer middleware
// export const uploadDocument = async (req, res) => {
//   try {
//     const { title, leadId, userId } = req.body;
//     const file = req.file;


//     // Validate required fields
//     if (!file) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'No file uploaded'
//       });
//     }

//     if (!title || !title.trim()) {
//       // Clean up uploaded file if title is missing
//       if (file.path) {
//         deleteUploadedFile(`documents/${file.filename}`);
//       }
//       return res.status(400).json({
//         status: 'error',
//         message: 'Document title is required'
//       });
//     }

//     // Create document record
//     const document = new Document({
//       title: title.trim(),
//       filename: file.filename,
//       originalName: file.originalname,
//       fileType: file.mimetype,
//       fileSize: file.size,
//       filePath: file.path,
//       fileUrl: `/uploads/document/${file.filename}`,
//       associatedLead: leadId || null,
//       uploadedBy: userId || null
//     });

//     await document.save();

//     // Populate the saved document
//     const populatedDocument = await Document.findById(document._id)
//       .populate('associatedLead', 'name lastName email phone')
//       .populate('uploadedBy', 'username email');

//     res.status(201).json({
//       status: 'success',
//       message: 'Document uploaded successfully',
//       data: populatedDocument
//     });

//   } catch (error) {
//     console.error('Error uploading document:', error);

//     // Clean up uploaded file on error
//     if (req.file && req.file.filename) {
//       try {
//         deleteUploadedFile(`documents/${req.file.filename}`);
//       } catch (unlinkError) {
//         console.error('Error cleaning up file:', unlinkError);
//       }
//     }

//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         status: 'error',
//         message: 'Validation error',
//         errors: errors
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Get all documents with filtering and pagination
// export const getDocuments = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = 'createdAt',
//       sortOrder = 'desc',
//       search,
//       associatedLead,
//       fileType,
//       startDate,
//       endDate
//     } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // Build filter object
//     const filter = { isActive: true };
    
//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { originalName: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (associatedLead) filter.associatedLead = associatedLead;
//     if (fileType) {
//       if (fileType === 'image') {
//         filter.fileType = { $regex: '^image/', $options: 'i' };
//       } else if (fileType === 'pdf') {
//         filter.fileType = 'application/pdf';
//       } else if (fileType === 'document') {
//         filter.fileType = { 
//           $in: [
//             'application/msword',
//             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//             'application/vnd.ms-excel',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//             'text/plain'
//           ]
//         };
//       }
//     }

//     // Date range filter
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     // Build sort object
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     const documents = await Document.find(filter)
//       .populate('associatedLead', 'name lastName email phone')
//       .populate('uploadedBy', 'username email')
//       .sort(sort)
//       .skip(skip)
//       .limit(limitNum);

//     const total = await Document.countDocuments(filter);
//     const totalPages = Math.ceil(total / limitNum);

//     res.status(200).json({
//       status: 'success',
//       message: 'Documents fetched successfully',
//       data: documents,
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalRecords: total,
//         hasNext: pageNum < totalPages,
//         hasPrev: pageNum > 1
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch documents',
//       error: error.message
//     });
//   }
// };

// // Get document by ID
// export const getDocumentById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findById(id)
//       .populate('associatedLead', 'name lastName email phone')
//       .populate('uploadedBy', 'username email');

//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Document fetched successfully',
//       data: document
//     });
//   } catch (error) {
//     console.error('Error fetching document:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch document',
//       error: error.message
//     });
//   }
// };

// // Download document
// export const downloadDocument = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findById(id);

//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'File not found on server'
//       });
//     }

//     // Set headers for download
//     res.setHeader('Content-Type', document.fileType);
//     res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
//     res.setHeader('Content-Length', document.fileSize);

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);

//   } catch (error) {
//     console.error('Error downloading document:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to download document',
//       error: error.message
//     });
//   }
// };

// // View document (for images and PDFs in browser)
// export const viewDocument = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findById(id);

//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'File not found on server'
//       });
//     }

//     // Set appropriate headers for viewing in browser
//     res.setHeader('Content-Type', document.fileType);
//     res.setHeader('Content-Length', document.fileSize);
    
//     // For images and PDFs, allow viewing in browser
//     if (document.fileType.startsWith('image/') || document.fileType === 'application/pdf') {
//       res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
//     } else {
//       res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
//     }

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);

//   } catch (error) {
//     console.error('Error viewing document:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to view document',
//       error: error.message
//     });
//   }
// };

// // Update document (only title can be updated)
// export const updateDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title } = req.body;

//     // Only allow title updates
//     const updateData = { title: title?.trim() };

//     // Remove undefined fields
//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] === undefined) {
//         delete updateData[key];
//       }
//     });

//     const updatedDocument = await Document.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { 
//         new: true, 
//         runValidators: true 
//       }
//     )
//     .populate('associatedLead', 'name lastName email phone')
//     .populate('uploadedBy', 'username email');

//     if (!updatedDocument) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Document updated successfully',
//       data: updatedDocument
//     });
//   } catch (error) {
//     console.error('Error updating document:', error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         status: 'error',
//         message: 'Validation error',
//         errors: errors
//       });
//     }

//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to update document',
//       error: error.message
//     });
//   }
// };

// // Delete document (soft delete)
// export const deleteDocument = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findById(id);

//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     // Soft delete by setting isActive to false
//     document.isActive = false;
//     await document.save();

//     res.status(200).json({
//       status: 'success',
//       message: 'Document deleted successfully',
//       data: {
//         id: document._id,
//         title: document.title
//       }
//     });
//   } catch (error) {
//     console.error('Error deleting document:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to delete document',
//       error: error.message
//     });
//   }
// };

// // Hard delete document (remove file from server)
// export const hardDeleteDocument = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findById(id);

//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document not found'
//       });
//     }

//     // Delete file from server using multer helper
//     deleteUploadedFile(`documents/${document.filename}`);

//     // Remove document from database
//     await Document.findByIdAndDelete(id);

//     res.status(200).json({
//       status: 'success',
//       message: 'Document permanently deleted',
//       data: {
//         id: document._id,
//         title: document.title
//       }
//     });
//   } catch (error) {
//     console.error('Error hard deleting document:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid document ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to delete document',
//       error: error.message
//     });
//   }
// };

// // Get documents by lead ID
// export const getDocumentsByLead = async (req, res) => {
//   try {
//     const { leadId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     const documents = await Document.find({
//       associatedLead: leadId,
//       isActive: true
//     })
//     .populate('uploadedBy', 'username email')
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limitNum);

//     const total = await Document.countDocuments({
//       associatedLead: leadId,
//       isActive: true
//     });
//     const totalPages = Math.ceil(total / limitNum);

//     res.status(200).json({
//       status: 'success',
//       message: 'Documents fetched successfully',
//       data: documents,
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalRecords: total,
//         hasNext: pageNum < totalPages,
//         hasPrev: pageNum > 1
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching documents by lead:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid lead ID format'
//       });
//     }

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch documents',
//       error: error.message
//     });
//   }
// };

// // Serve document file
// export const serveDocument = async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'File not found'
//       });
//     }

//     // Get file info from database
//     const document = await Document.findOne({ filename });
    
//     if (!document) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Document record not found'
//       });
//     }

//     // Set appropriate headers
//     res.setHeader('Content-Type', document.fileType);
//     res.setHeader('Content-Length', document.fileSize);
    
//     // For images and PDFs, allow viewing in browser
//     if (document.fileType.startsWith('image/') || document.fileType === 'application/pdf') {
//       res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
//     } else {
//       res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
//     }

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);

//   } catch (error) {
//     console.error('Error serving document:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to serve document',
//       error: error.message
//     });
//   }
// };


import Document from '../models/documentModel.js';
import Activity from '../models/activityModel.js';
import { deleteUploadedFile } from '../middleware/multer.js';
import fs from 'fs';
import path from 'path';

// Upload document using multer middleware
export const uploadDocument = async (req, res) => {
  try {
    const { title, leadId, userId } = req.body;
    const file = req.file;

    // Validate required fields
    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    if (!title || !title.trim()) {
      // Clean up uploaded file if title is missing
      if (file.path) {
        deleteUploadedFile(`documents/${file.filename}`);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Document title is required'
      });
    }

    // Create document record
    const document = new Document({
      title: title.trim(),
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      fileUrl: `/uploads/document/${file.filename}`,
      associatedLead: leadId || null,
      uploadedBy: userId || null
    });

    await document.save();

    // Populate the saved document
    const populatedDocument = await Document.findById(document._id)
      .populate('associatedLead', 'name lastName email phone')
      .populate('uploadedBy', 'username email');

    // Create activity for document upload
    const activity = new Activity({
      user: userId || req.user?._id,
      type: 'document_uploaded',
      content: `Document "${title.trim()}" uploaded`,
      contentId: document._id,
      metadata: {
        title: title.trim(),
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        associatedLead: leadId || null,
        filename: file.filename
      }
    });

    await activity.save();

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: populatedDocument
    });

  } catch (error) {
    console.error('Error uploading document:', error);

    // Clean up uploaded file on error
    if (req.file && req.file.filename) {
      try {
        deleteUploadedFile(`documents/${req.file.filename}`);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all documents with filtering and pagination
export const getDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      associatedLead,
      fileType,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    if (associatedLead) filter.associatedLead = associatedLead;
    if (fileType) {
      if (fileType === 'image') {
        filter.fileType = { $regex: '^image/', $options: 'i' };
      } else if (fileType === 'pdf') {
        filter.fileType = 'application/pdf';
      } else if (fileType === 'document') {
        filter.fileType = { 
          $in: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
          ]
        };
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const documents = await Document.find(filter)
      .populate('associatedLead', 'name lastName email phone')
      .populate('uploadedBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Document.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Documents fetched successfully',
      data: documents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('associatedLead', 'name lastName email phone')
      .populate('uploadedBy', 'username email');

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Document fetched successfully',
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize);

    // Create activity for document download
    const activity = new Activity({
      user: req.user?._id || document.uploadedBy,
      type: 'document_downloaded',
      content: `Document "${document.title}" downloaded`,
      contentId: document._id,
      metadata: {
        title: document.title,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize
      }
    });

    await activity.save();

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// View document (for images and PDFs in browser)
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    // Set appropriate headers for viewing in browser
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Length', document.fileSize);
    
    // For images and PDFs, allow viewing in browser
    if (document.fileType.startsWith('image/') || document.fileType === 'application/pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    }

    // Create activity for document view
    const activity = new Activity({
      user: req.user?._id || document.uploadedBy,
      type: 'document_viewed',
      content: `Document "${document.title}" viewed`,
      contentId: document._id,
      metadata: {
        title: document.title,
        originalName: document.originalName,
        fileType: document.fileType,
        viewedInBrowser: document.fileType.startsWith('image/') || document.fileType === 'application/pdf'
      }
    });

    await activity.save();

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error viewing document:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to view document',
      error: error.message
    });
  }
};

// Update document (only title can be updated)
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Get current document before update
    const currentDocument = await Document.findById(id);
    if (!currentDocument) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Only allow title updates
    const updateData = { title: title?.trim() };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('associatedLead', 'name lastName email phone')
    .populate('uploadedBy', 'username email');

    if (!updatedDocument) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Create activity for document update
    const activity = new Activity({
      user: req.user?._id || updatedDocument.uploadedBy,
      type: 'document_updated',
      content: `Document title updated from "${currentDocument.title}" to "${title.trim()}"`,
      contentId: updatedDocument._id,
      metadata: {
        previousTitle: currentDocument.title,
        newTitle: title.trim(),
        originalName: updatedDocument.originalName,
        fileType: updatedDocument.fileType
      }
    });

    await activity.save();

    res.status(200).json({
      status: 'success',
      message: 'Document updated successfully',
      data: updatedDocument
    });
  } catch (error) {
    console.error('Error updating document:', error);
    
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
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update document',
      error: error.message
    });
  }
};

// Delete document (soft delete)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Store document data for activity before deletion
    const documentData = {
      title: document.title,
      originalName: document.originalName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      associatedLead: document.associatedLead
    };

    // Soft delete by setting isActive to false
    document.isActive = false;
    await document.save();

    // Create activity for document deletion
    const activity = new Activity({
      user: req.user?._id || document.uploadedBy,
      type: 'document_deleted',
      content: `Document "${document.title}" deleted`,
      contentId: document._id,
      metadata: documentData
    });

    await activity.save();

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
      data: {
        id: document._id,
        title: document.title
      }
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Hard delete document (remove file from server)
export const hardDeleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Store document data for activity before deletion
    const documentData = {
      title: document.title,
      originalName: document.originalName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      associatedLead: document.associatedLead,
      filename: document.filename
    };

    // Delete file from server using multer helper
    deleteUploadedFile(`documents/${document.filename}`);

    // Remove document from database
    await Document.findByIdAndDelete(id);

    // Create activity for hard document deletion
    const activity = new Activity({
      user: req.user?._id || document.uploadedBy,
      type: 'document_permanently_deleted',
      content: `Document "${document.title}" permanently deleted including file from server`,
      contentId: document._id,
      metadata: documentData
    });

    await activity.save();

    res.status(200).json({
      status: 'success',
      message: 'Document permanently deleted',
      data: {
        id: document._id,
        title: document.title
      }
    });
  } catch (error) {
    console.error('Error hard deleting document:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get documents by lead ID
export const getDocumentsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const documents = await Document.find({
      associatedLead: leadId,
      isActive: true
    })
    .populate('uploadedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const total = await Document.countDocuments({
      associatedLead: leadId,
      isActive: true
    });
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Documents fetched successfully',
      data: documents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching documents by lead:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid lead ID format'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Serve document file
export const serveDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Get file info from database
    const document = await Document.findOne({ filename });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Length', document.fileSize);
    
    // For images and PDFs, allow viewing in browser
    if (document.fileType.startsWith('image/') || document.fileType === 'application/pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    }

    // Create activity for document serving
    const activity = new Activity({
      user: req.user?._id || document.uploadedBy,
      type: 'document_served',
      content: `Document "${document.title}" served`,
      contentId: document._id,
      metadata: {
        title: document.title,
        originalName: document.originalName,
        fileType: document.fileType,
        servedVia: 'direct_file_serve'
      }
    });

    await activity.save();

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to serve document',
      error: error.message
    });
  }
};