// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Ensure upload directories exist
// const ensureUploadDirectories = () => {
//   const uploadDirs = [
//     './uploads',
//     './uploads/user',
//     './uploads/leads',
//     './uploads/pdf',
//     './uploads/documents',
//     './uploads/notes',
//     './uploads/carImages',
//     './uploads/carDocuments'
//   ];
  
//   uploadDirs.forEach(dir => {
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//   });
// };

// // Configure storage for different file types
// const createStorage = (folder) => {
//   return multer.diskStorage({
//     destination: function (req, file, cb) {
//       ensureUploadDirectories();
//       cb(null, `./uploads/${folder}/`);
//     },
//     filename: function (req, file, cb) {
//       // Create unique filename with timestamp
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       const extension = path.extname(file.originalname);
//       const baseName = path.basename(file.originalname, extension);
//       cb(null, `${baseName}-${uniqueSuffix}${extension}`);
//     }
//   });
// };

// // File filter for different file types
// const createFileFilter = (allowedTypes) => {
//   return (req, file, cb) => {
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed!`), false);
//     }
//   };
// };

// // Predefined configurations for different file types
// export const uploadConfigs = {
//   userImage: {
//     storage: createStorage('user'),
//     limits: {
//       fileSize: 2 * 1024 * 1024 // 2MB limit
//     },
//     fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
//   },
//   leadImage: {
//     storage: createStorage('leads'),
//     limits: {
//       fileSize: 2 * 1024 * 1024 // 2MB limit
//     },
//     fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
//   },
//   pdf: {
//     storage: createStorage('pdf'),
//     limits: {
//       fileSize: 5 * 1024 * 1024 // 5MB limit for PDFs
//     },
//     fileFilter: createFileFilter(['application/pdf'])
//   },
//   note: {
//     storage: createStorage('notes'),
//     limits: {
//       fileSize: 5 * 1024 * 1024 // 5MB limit for notes
//     },
//     fileFilter: createFileFilter([
//       'application/pdf', 
//       'image/jpeg', 
//       'image/jpg', 
//       'image/png', 
//       'image/gif', 
//       'text/plain', 
//       'application/msword', 
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ])
//   },
//   carImage: {
//     storage: createStorage('carImages'),
//     limits: {
//       fileSize: 3 * 1024 * 1024 // 3MB limit for car images
//     },
//     fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
//   },
//   carDocument: {
//     storage: createStorage('carDocuments'),
//     limits: {
//       fileSize: 10 * 1024 * 1024 // 10MB limit for car documents
//     },
//     fileFilter: createFileFilter([
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ]),
//   },
//   document: {
//     storage: createStorage('document'),
//     limits: {
//       fileSize: 10 * 1024 * 1024 // 10MB limit for documents
//     },
//     fileFilter: createFileFilter([
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ])
//   }
// };



// // Create upload middleware for different types
// export const uploadUserImage = multer(uploadConfigs.userImage).single('profileImage');
// export const uploadLeadImage = multer(uploadConfigs.leadImage).single('leadImage');
// export const uploadNote = multer(uploadConfigs.note).any('attachments'); // Accept multiple files for notes
// export const uploadPdf = multer(uploadConfigs.pdf).single('pdfFile');
// export const uploadDocuments = multer(uploadConfigs.document).single('document');
// export const uploadCarImages = multer(uploadConfigs.carImage).single('carImages'); // Single image for cars
// export const uploadCarDocument = multer(uploadConfigs.carDocument).single('carDocuments'); // Single document for cars




// // Combined middleware for car files (both image and document)
// export const uploadCarFiles = multer({
//   storage: createStorage('carFiles'),
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: function (req, file, cb) {
//     // Allow both images and documents
//     const allowedTypes = [
//       'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
//        'application/vnd.ms-excel',
//       'text/csv',
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ];
    
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image and document files are allowed!'), false);
//     }
//   }
// }).fields([
//   { name: 'carImages', maxCount: 1 },
//   { name: 'carDocuments', maxCount: 1 }
// ]);

// // Generic upload middleware
// export const createUploadMiddleware = (type, fieldName = 'file') => {
//   const config = uploadConfigs[type];
//   if (!config) {
//     throw new Error(`Upload type ${type} is not defined`);
//   }
//   return multer(config).single(fieldName);
// };

// // Middleware for handling upload errors
// export const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'File too large. Please check the size limit.'
//       });
//     }
//     if (err.code === 'LIMIT_FILE_COUNT') {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Too many files uploaded.'
//       });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Unexpected field name for file upload.'
//       });
//     }
//   } else if (err) {
//     return res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
//   next();
// };

// // Middleware to process uploaded file info for single files
// export const processUploadedFile = (folder) => (req, res, next) => {
//   if (req.file) {
//     req.file.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
//   }
//   next();
// };

// // Middleware to process uploaded files info for multiple files
// export const processUploadedFiles = (req, res, next) => {
//   if (req.files) {
//     // Create filesByField object to organize files by field name
//     req.filesByField = {};
    
//     if (req.files['carImages']) {
//       req.filesByField.carImages = req.files['carImages'].map(file => ({
//         filename: file.filename,
//         originalName: file.originalname,
//         mimetype: file.mimetype,
//         size: file.size,
//         fileUrl: `/uploads/carFiles/${file.filename}`
//       }));
//     }
    
//     if (req.files['carDocuments']) {
//       req.filesByField.carDocuments = req.files['carDocuments'].map(file => ({
//         filename: file.filename,
//         originalName: file.originalname,
//         mimetype: file.mimetype,
//         size: file.size,
//         fileUrl: `/uploads/carFiles/${file.filename}`
//       }));
//     }
//   }
//   next();
// };

// // Get all uploaded files for a specific type
// export const getUploadedFiles = (type) => {
//   const dirPath = `./uploads/${type}`;
//   if (!fs.existsSync(dirPath)) {
//     return [];
//   }
//   return fs.readdirSync(dirPath).map(file => ({
//     name: file,
//     path: `${type}/${file}`
//   }));
// };

// // Delete a specific file
// export const deleteUploadedFile = (filePath) => {
//   const fullPath = `./uploads/${filePath}`;
//   if (fs.existsSync(fullPath)) {
//     fs.unlinkSync(fullPath);
//     return true;
//   }
//   return false;
// };





import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const uploadDirs = [
    './uploads',
    './uploads/user',
    './uploads/leads',
    './uploads/pdf',
    './uploads/documents',
    './uploads/notes',
    './uploads/carImages',
    './uploads/carDocuments',
    './uploads/sellOpportunity',
    './uploads/rcUpload',
    './uploads/serviceHistory',
    './uploads/deliveryFiles'
  ];
  
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Configure storage for different file types
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      ensureUploadDirectories();
      cb(null, `./uploads/${folder}/`);
    },
    filename: function (req, file, cb) {
      // Create unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
  });
};

// File filter for different file types
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed!`), false);
    }
  };
};

// Predefined configurations for different file types
export const uploadConfigs = {
  userImage: {
    storage: createStorage('user'),
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
  },
  leadImage: {
    storage: createStorage('leads'),
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
  },
  pdf: {
    storage: createStorage('pdf'),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for PDFs
    },
    fileFilter: createFileFilter(['application/pdf'])
  },
  note: {
    storage: createStorage('notes'),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for notes
    },
    fileFilter: createFileFilter([
      'application/pdf', 
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'text/plain', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  },
  carImage: {
    storage: createStorage('carImages'),
    limits: {
      fileSize: 3 * 1024 * 1024 // 3MB limit for car images
    },
    fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
  },
  carDocument: {
    storage: createStorage('carDocuments'),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit for car documents
    },
    fileFilter: createFileFilter([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]),
  },
  document: {
    storage: createStorage('document'),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit for documents
    },
    fileFilter: createFileFilter([
      'image/jpeg', 
      'image/jpg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  },
  // SELL OPPORTUNITY CONFIGURATIONS
  sellOpportunity: {
    storage: createStorage('sellOpportunity'),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: createFileFilter([
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  },
  carImages: {
    storage: createStorage('carImages'),
    limits: {
      fileSize: 3 * 1024 * 1024 // 3MB limit
    },
    fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
  },
  rcUpload: {
    storage: createStorage('rcUpload'),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: createFileFilter([
      'application/pdf',
      'image/jpeg', 
      'image/jpg', 
      'image/png'
    ])
  },
  serviceHistory: {
    storage: createStorage('serviceHistory'),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: createFileFilter([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 
      'image/jpg', 
      'image/png'
    ])
  },
  deliveryFile: {
    storage: createStorage('deliveryFiles'),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: createFileFilter([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 
      'image/jpg', 
      'image/png'
    ])
  },
  leadImage: {
  storage: createStorage('leads'),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: createFileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'])
},

};

// Create upload middleware for different types
export const uploadUserImage = multer(uploadConfigs.userImage).single('profileImage');
export const uploadLeadImage = multer(uploadConfigs.leadImage).single('leadImage');
export const uploadNote = multer(uploadConfigs.note).any('attachments'); // Accept multiple files for notes
export const uploadPdf = multer(uploadConfigs.pdf).single('pdfFile');
export const uploadDocuments = multer(uploadConfigs.document).single('document');
export const uploadCarImages = multer(uploadConfigs.carImage).single('carImages'); // Single image for cars
export const uploadCarDocument = multer(uploadConfigs.carDocument).single('carDocuments'); // Single document for cars
export const uploadLeadProfileImage = multer(uploadConfigs.leadImage).single('profileImage');
// SELL OPPORTUNITY UPLOAD MIDDLEWARES
export const uploadSellOpportunity = multer(uploadConfigs.sellOpportunity).any();
export const uploadSellCarImages = multer(uploadConfigs.carImages).array('carImages', 10); // max 10 images
export const uploadRcDocument = multer(uploadConfigs.rcUpload).single('rcUpload');
export const uploadServiceHistory = multer(uploadConfigs.serviceHistory).array('serviceHistory', 5); // max 5 files
export const uploadDeliveryFile = multer(uploadConfigs.deliveryFile).array('deliveryFiles');

// Combined middleware for sell opportunity files
export const uploadSellOpportunityFiles = multer({
  storage: createStorage('sellOpportunity'),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed!'), false);
    }
  }
}).fields([
  { name: 'carImages', maxCount: 10 },
  { name: 'rcUpload', maxCount: 1 },
  { name: 'serviceHistory', maxCount: 5 }
]);

// Combined middleware for car files (both image and document)
export const uploadCarFiles = multer({
  storage: createStorage('carFiles'),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow both images and documents
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
       'application/vnd.ms-excel',
      'text/csv',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed!'), false);
    }
  }
}).fields([
  { name: 'carImages', maxCount: 1 },
  { name: 'carDocuments', maxCount: 1 }
]);

// Generic upload middleware
export const createUploadMiddleware = (type, fieldName = 'file') => {
  const config = uploadConfigs[type];
  if (!config) {
    throw new Error(`Upload type ${type} is not defined`);
  }
  return multer(config).single(fieldName);
};

// Middleware for handling upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'fail',
        message: 'File too large. Please check the size limit.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'fail',
        message: 'Too many files uploaded.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Unexpected field name for file upload.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
  next();
};

// Middleware to process uploaded file info for single files
export const processUploadedFile = (folder) => (req, res, next) => {
  if (req.file) {
    req.file.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
  }
  next();
};

// Middleware to process uploaded files info for multiple files
export const processUploadedFiles = (req, res, next) => {
  if (req.files) {
    // Create filesByField object to organize files by field name
    req.filesByField = {};
    
    // Process car images
    if (req.files['carImages']) {
      req.filesByField.carImages = req.files['carImages'].map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileUrl: `/uploads/sellOpportunity/${file.filename}`,
        uploadedAt: new Date()
      }));
    }
    
    // Process RC upload
    if (req.files['rcUpload']) {
      req.filesByField.rcUpload = req.files['rcUpload'].map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileUrl: `/uploads/sellOpportunity/${file.filename}`,
        uploadedAt: new Date()
      }));
    }
    
    // Process service history
    if (req.files['serviceHistory']) {
      req.filesByField.serviceHistory = req.files['serviceHistory'].map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileUrl: `/uploads/sellOpportunity/${file.filename}`,
        uploadedAt: new Date()
      }));
    }
    
    // Process car documents (for existing functionality)
    if (req.files['carDocuments']) {
      req.filesByField.carDocuments = req.files['carDocuments'].map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileUrl: `/uploads/carFiles/${file.filename}`
      }));
    }
  }
  next();
};

// Enhanced process uploaded files for sell opportunity
export const processSellOpportunityFiles = (req, res, next) => {
  if (req.files) {
    req.filesByField = {};
    
    const processFileGroup = (fieldName) => {
      if (req.files[fieldName]) {
        return req.files[fieldName].map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fileUrl: `/uploads/sellOpportunity/${file.filename}`,
          uploadedAt: new Date()
        }));
      }
      return [];
    };

    req.filesByField.carImages = processFileGroup('carImages');
    req.filesByField.rcUpload = processFileGroup('rcUpload');
    req.filesByField.serviceHistory = processFileGroup('serviceHistory');
  }
  next();
};

// Get all uploaded files for a specific type
export const getUploadedFiles = (type) => {
  const dirPath = `./uploads/${type}`;
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath).map(file => ({
    name: file,
    path: `${type}/${file}`
  }));
};

// Delete a specific file
export const deleteUploadedFile = (filePath) => {
  const fullPath = `./uploads/${filePath}`;
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

// Clean up files by array of file objects
export const cleanupFiles = (filesArray) => {
  if (!filesArray || !Array.isArray(filesArray)) return;
  
  filesArray.forEach(file => {
    if (file.filename) {
      const filePath = `./uploads/sellOpportunity/${file.filename}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
};

// Export all upload types for easy access
export const UPLOAD_TYPES = {
  USER_IMAGE: 'userImage',
  LEAD_IMAGE: 'leadImage',
  PDF: 'pdf',
  NOTE: 'note',
  CAR_IMAGE: 'carImage',
  CAR_DOCUMENT: 'carDocument',
  DOCUMENT: 'document',
  SELL_OPPORTUNITY: 'sellOpportunity',
  RC_UPLOAD: 'rcUpload',
  SERVICE_HISTORY: 'serviceHistory'
};

export default {
  uploadConfigs,
  uploadUserImage,
  uploadLeadImage,
  uploadNote,
  uploadPdf,
  uploadDocuments,
  uploadCarImages,
  uploadCarDocument,
  uploadSellOpportunity,
  uploadSellCarImages,
  uploadRcDocument,
  uploadServiceHistory,
  uploadSellOpportunityFiles,
  uploadCarFiles,
  createUploadMiddleware,
  handleUploadError,
  processUploadedFile,
  processUploadedFiles,
  processSellOpportunityFiles,
  getUploadedFiles,
  deleteUploadedFile,
  cleanupFiles,
  UPLOAD_TYPES
};