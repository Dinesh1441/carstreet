// import DeliveryForm from '../models/deliveryModel.js';

// // Update delivery form
// export const updateDeliveryForm = async (req, res) => {
//   try {
//     const {
//       name,
//       phoneNumber,
//       soldBy,
//       car,
//       deliveryStatus,
//       rtoTransferred,
//       expectedCompletionDate,
//       actualDeliveryDate,
//       status
//     } = req.body;

//     console.log('Update request body:', req.body);
//     console.log('Update request files:', req.files);

//     const deliveryForm = await DeliveryForm.findById(req.params.id);

//     if (!deliveryForm) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery form not found'
//       });
//     }

//     // Update fields
//     if (name) deliveryForm.name = name;
//     if (phoneNumber) deliveryForm.phoneNumber = phoneNumber;
//     if (soldBy) deliveryForm.soldBy = soldBy;
//     if (car) deliveryForm.car = car;
//     if (deliveryStatus) deliveryForm.deliveryStatus = deliveryStatus;
//     if (rtoTransferred) deliveryForm.rtoTransferred = rtoTransferred;
//     if (expectedCompletionDate) deliveryForm.expectedCompletionDate = expectedCompletionDate;
//     if (actualDeliveryDate) deliveryForm.actualDeliveryDate = actualDeliveryDate;
//     if (status) deliveryForm.status = status;

//     // Handle file uploads if any
//     if (req.files && req.files.length > 0) {
//       console.log('Processing new files:', req.files);
      
//       const newDocuments = req.files.map(file => ({
//         name: file.originalname,
//         fileName: file.originalname, // Add fileName field for validation
//         fileUrl: file.path || file.fileUrl,
//         uploadedAt: new Date()
//       }));

//       console.log('New documents to add:', newDocuments);

//       // Add new documents to existing ones
//       deliveryForm.documents = [...deliveryForm.documents, ...newDocuments];
//     }

//     // Set updatedBy if user is authenticated
//     if (req.user) {
//       deliveryForm.updatedBy = req.user.id;
//     }

//     console.log('Saving delivery form...');
//     const updatedForm = await deliveryForm.save();
//     console.log('Delivery form saved successfully');
    
//     // Populate the updated form
//     const populatedForm = await DeliveryForm.findById(updatedForm._id)
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .populate('createdBy', 'username email')
//       .populate('updatedBy', 'username email');

//     res.json({
//       success: true,
//       message: 'Delivery form updated successfully',
//       data: populatedForm
//     });
//   } catch (error) {
//     console.error('Update delivery form error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating delivery form',
//       error: error.message
//     });
//   }
// };

// // Create delivery form
// export const createDeliveryForm = async (req, res) => {
//   try {
//     const {
//       name,
//       phoneNumber,
//       leadId,
//       soldBy,
//       car,
//       deliveryStatus,
//       rtoTransferred,
//       expectedCompletionDate,
//       status
//     } = req.body;

//     console.log('Create request body:', req.body);
//     console.log('Create request files:', req.files);

//     // Validate required fields
//     if (!name || !phoneNumber || !soldBy || !car || !expectedCompletionDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please fill all required fields'
//       });
//     }

//     // Prepare documents array
//     let documents = [];
//     if (req.files && req.files.length > 0) {
//       documents = req.files.map(file => ({
//         name: file.originalname,
//         fileName: file.originalname, // Add fileName field for validation
//         fileUrl: file.path || file.fileUrl,
//         uploadedAt: new Date()
//       }));
//     }

//     const newDeliveryForm = new DeliveryForm({
//       name,
//       phoneNumber,
//       leadId: leadId || null,
//       soldBy,
//       car,
//       deliveryStatus: deliveryStatus || 'Not Delivered',
//       rtoTransferred: rtoTransferred || 'No',
//       expectedCompletionDate,
//       status: status || 'Pending',
//       documents
//     });

//     // Set createdBy if user is authenticated
//     if (req.user) {
//       newDeliveryForm.createdBy = req.user.id;
//     }

//     console.log('Saving new delivery form...');
//     const savedForm = await newDeliveryForm.save();
//     console.log('Delivery form created successfully');

//     // Populate the created form
//     const populatedForm = await DeliveryForm.findById(savedForm._id)
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .populate('createdBy', 'username email');

//     res.status(201).json({
//       success: true,
//       message: 'Delivery form created successfully',
//       data: populatedForm
//     });
//   } catch (error) {
//     console.error('Create delivery form error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating delivery form',
//       error: error.message
//     });
//   }
// };

// // Add document to delivery form
// export const addDocument = async (req, res) => {
//   try {
//     const deliveryForm = await DeliveryForm.findById(req.params.id);
    
//     if (!deliveryForm) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery form not found'
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     const newDocument = {
//       name: req.file.originalname,
//       fileName: req.file.originalname, // Add fileName field for validation
//       fileUrl: req.file.path || req.file.fileUrl,
//       uploadedAt: new Date()
//     };

//     deliveryForm.documents.push(newDocument);
//     await deliveryForm.save();

//     res.json({
//       success: true,
//       message: 'Document added successfully',
//       data: newDocument
//     });
//   } catch (error) {
//     console.error('Add document error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error adding document',
//       error: error.message
//     });
//   }
// };

// // Remove document from delivery form
// export const removeDocument = async (req, res) => {
//   try {
//     const { id, docId } = req.params;

//     const deliveryForm = await DeliveryForm.findById(id);
    
//     if (!deliveryForm) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery form not found'
//       });
//     }

//     // Find the document index
//     const documentIndex = deliveryForm.documents.findIndex(doc => doc._id.toString() === docId);
    
//     if (documentIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: 'Document not found'
//       });
//     }

//     // Remove the document from the array
//     deliveryForm.documents.splice(documentIndex, 1);
//     await deliveryForm.save();

//     res.json({
//       success: true,
//       message: 'Document removed successfully'
//     });
//   } catch (error) {
//     console.error('Remove document error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error removing document',
//       error: error.message
//     });
//   }
// };

// // Get all delivery forms
// export const getAllDeliveryForms = async (req, res) => {
//   try {
//     const deliveryForms = await DeliveryForm.find()
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//        .populate({
//     path: 'car',
//     select: 'year color price', // Include these fields from the Car document
//     populate: [
//       { path: 'brand', select: 'make' },   // Populate brand from makeModel
//       { path: 'model', select: 'name' },   // Populate model from CarModel
//       { path: 'variant', select: 'name' }  // Populate variant from CarVariant
//     ]
//   })
//       .populate('createdBy', 'username email')
//       .populate('updatedBy', 'username email')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       message: 'Delivery forms fetched successfully',
//       data: deliveryForms
//     });
//   } catch (error) {
//     console.error('Get all delivery forms error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching delivery forms',
//       error: error.message
//     });
//   }
// };

// // Get delivery form by ID
// export const getDeliveryFormById = async (req, res) => {
//   try {
//     const deliveryForm = await DeliveryForm.findById(req.params.id)
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .populate('createdBy', 'username email')
//       .populate('updatedBy', 'username email');

//     if (!deliveryForm) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery form not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Delivery form fetched successfully',
//       data: deliveryForm
//     });
//   } catch (error) {
//     console.error('Get delivery form by ID error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching delivery form',
//       error: error.message
//     });
//   }
// };

// // Delete delivery form
// export const deleteDeliveryForm = async (req, res) => {
//   try {
//     const deliveryForm = await DeliveryForm.findByIdAndDelete(req.params.id);

//     if (!deliveryForm) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery form not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Delivery form deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete delivery form error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting delivery form',
//       error: error.message
//     });
//   }
// };

// // Other controller functions...
// export const getDeliveryFormsByLead = async (req, res) => {
//   try {
//     const deliveryForms = await DeliveryForm.find({ leadId: req.params.leadId })
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       message: 'Delivery forms fetched successfully',
//       data: deliveryForms
//     });
//   } catch (error) {
//     console.error('Get delivery forms by lead error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching delivery forms',
//       error: error.message
//     });
//   }
// };

// export const getDeliveryFormsByStatus = async (req, res) => {
//   try {
//     const deliveryForms = await DeliveryForm.find({ deliveryStatus: req.params.status })
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       message: 'Delivery forms fetched successfully',
//       data: deliveryForms
//     });
//   } catch (error) {
//     console.error('Get delivery forms by status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching delivery forms',
//       error: error.message
//     });
//   }
// };

// export const getOverdueDeliveryForms = async (req, res) => {
//   try {
//     const today = new Date();
//     const deliveryForms = await DeliveryForm.find({
//       expectedCompletionDate: { $lt: today },
//       deliveryStatus: 'Not Delivered'
//     })
//       .populate('leadId', 'name email status')
//       .populate('soldBy', 'username email')
//       .populate('car')
//       .sort({ expectedCompletionDate: 1 });

//     res.json({
//       success: true,
//       message: 'Overdue delivery forms fetched successfully',
//       data: deliveryForms
//     });
//   } catch (error) {
//     console.error('Get overdue delivery forms error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching overdue delivery forms',
//       error: error.message
//     });
//   }
// };

// export const getDeliveryStats = async (req, res) => {
//   try {
//     const totalForms = await DeliveryForm.countDocuments();
//     const deliveredForms = await DeliveryForm.countDocuments({ deliveryStatus: 'Delivered' });
//     const pendingForms = await DeliveryForm.countDocuments({ deliveryStatus: 'Not Delivered' });
//     const rtoTransferred = await DeliveryForm.countDocuments({ rtoTransferred: 'Yes' });

//     const today = new Date();
//     const overdueForms = await DeliveryForm.countDocuments({
//       expectedCompletionDate: { $lt: today },
//       deliveryStatus: 'Not Delivered'
//     });

//     res.json({
//       success: true,
//       message: 'Delivery stats fetched successfully',
//       data: {
//         totalForms,
//         deliveredForms,
//         pendingForms,
//         rtoTransferred,
//         overdueForms
//       }
//     });
//   } catch (error) {
//     console.error('Get delivery stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching delivery stats',
//       error: error.message
//     });
//   }
// };


import DeliveryForm from '../models/deliveryModel.js';
import Activity from '../models/activityModel.js';
import Car from '../models/carModel.js';

// Update delivery form
export const updateDeliveryForm = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      soldBy,
      car,
      deliveryStatus,
      rtoTransferred,
      expectedCompletionDate,
      actualDeliveryDate,
      status
    } = req.body;

    // console.log('Update request body:', req.body);
    // console.log('Update request files:', req.files);

    const deliveryForm = await DeliveryForm.findById(req.params.id);

    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    // Store previous data for activity tracking
    const previousData = {
      name: deliveryForm.name,
      deliveryStatus: deliveryForm.deliveryStatus,
      rtoTransferred: deliveryForm.rtoTransferred,
      status: deliveryForm.status
    };

    // Update fields
    if (name) deliveryForm.name = name;
    if (phoneNumber) deliveryForm.phoneNumber = phoneNumber;
    if (soldBy) deliveryForm.soldBy = soldBy;
    if (car) deliveryForm.car = car;
    if (deliveryStatus) deliveryForm.deliveryStatus = deliveryStatus;
    if (rtoTransferred) deliveryForm.rtoTransferred = rtoTransferred;
    if (expectedCompletionDate) deliveryForm.expectedCompletionDate = expectedCompletionDate;
    if (actualDeliveryDate) deliveryForm.actualDeliveryDate = actualDeliveryDate;
    if (status) deliveryForm.status = status;

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      console.log('Processing new files:', req.files);
      
      const newDocuments = req.files.map(file => ({
        name: file.originalname,
        fileName: file.originalname, // Add fileName field for validation
        fileUrl: file.path || file.fileUrl,
        uploadedAt: new Date()
      }));

      console.log('New documents to add:', newDocuments);

      // Add new documents to existing ones
      deliveryForm.documents = [...deliveryForm.documents, ...newDocuments];
    }

    // Set updatedBy if user is authenticated
    if (req.user) {
      deliveryForm.updatedBy = req.user.id;
    }

    // console.log('Saving delivery form...');
    const updatedForm = await deliveryForm.save();
    // console.log('Delivery form saved successfully');
    
    // Populate the updated form
    const populatedForm = await DeliveryForm.findById(updatedForm._id)
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
       .populate({
          path: 'car',
          populate: [
            { path: 'brand', select: 'make' },
            { path: 'model', select: 'name' }
          ]
        })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

      console.log('Populated form:', populatedForm);

    // Create activity for delivery form update
    const activity = new Activity({
      user: req.user?._id || deliveryForm.soldBy,
      type: 'delivery_form_updated',
      content: `Delivery form updated for "${deliveryForm.name}"`,
      contentId: deliveryForm._id,
      leadId: deliveryForm.leadId, 
      metadata: {
        name: populatedForm.name,
        SoldBy : populatedForm.soldBy.username,
        Car : populatedForm.car.brand.make + ' ' + populatedForm.car.model.name,
        color : populatedForm.car.color,
        deliveryStatus: populatedForm.deliveryStatus,
        rtoTransferred: populatedForm.rtoTransferred,
        documentsAdded: req.files ? req.files.length : 0
      }
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Delivery form updated successfully',
      data: populatedForm
    });
  } catch (error) {
    console.error('Update delivery form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery form',
      error: error.message
    });
  }
};

// Create delivery form
export const createDeliveryForm = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      leadId,
      soldBy,
      car,
      deliveryStatus,
      rtoTransferred,
      expectedCompletionDate,
      status
    } = req.body;

    // console.log('Create request body:', req.body);
    // console.log('Create request files:', req.files);

    // Validate required fields
    if (!name || !phoneNumber || !soldBy || !car || !expectedCompletionDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Prepare documents array
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(file => ({
        name: file.originalname,
        fileName: file.originalname, // Add fileName field for validation
        fileUrl: file.path || file.fileUrl,
        uploadedAt: new Date()
      }));
    }


    const createdBy = req.user ? req.user.id : null;


    const newDeliveryForm = new DeliveryForm({
      name,
      phoneNumber,
      leadId: leadId || null,
      soldBy,
      car,
      deliveryStatus: deliveryStatus || 'Not Delivered',
      rtoTransferred: rtoTransferred || 'No',
      expectedCompletionDate,
      status: status || 'Pending',
      documents,
      createdBy
    });

    // Set createdBy if user is authenticated
    if (req.user) {
      newDeliveryForm.createdBy = req.user.id;
    }

    // console.log('Saving new delivery form...');
    const savedForm = await newDeliveryForm.save();
    // console.log('Delivery form created successfully');

    await Car.findByIdAndUpdate(car, { status: 'Sold' });
    // Populate the created form
    const populatedForm = await DeliveryForm.findById(savedForm._id)
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate({
        path: 'car',
        populate: [
          { path: 'brand', select: 'make' },
          { path: 'model', select: 'name' }
        ]
      })
      .populate('createdBy', 'username email');

      



    // Create activity for delivery form creation
    const activity = new Activity({
      user: req.user?._id || soldBy,
      type: 'delivery_form_created',
      content: `Delivery form created for "${name}"`,
      contentId: savedForm._id,
      leadId: leadId,
      metadata: {
        Name : name,
        MobileNo : phoneNumber,
        soldBy : populatedForm.soldBy.username,
        car : populatedForm.car.brand?.make + ' ' + populatedForm.car.model?.name,
        deliveryStatus: deliveryStatus || 'Not Delivered',
        rtoTransferred: rtoTransferred || 'No',
        expectedCompletionDate,
        // status: status || 'Pending',
        documentsCount: documents.length
      }
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Delivery form created successfully',
      data: populatedForm
    });
  } catch (error) {
    console.error('Create delivery form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery form',
      error: error.message
    });
  }
};

// Add document to delivery form
export const addDocument = async (req, res) => {
  try {
    const deliveryForm = await DeliveryForm.findById(req.params.id);
    
    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const newDocument = {
      name: req.file.originalname,
      fileName: req.file.originalname, // Add fileName field for validation
      fileUrl: req.file.path || req.file.fileUrl,
      uploadedAt: new Date()
    };

    deliveryForm.documents.push(newDocument);
    await deliveryForm.save();

    // Create activity for document addition
    const activity = new Activity({
      user: req.user?._id || deliveryForm.soldBy,
      type: 'delivery_form_document_added',
      content: `Document "${req.file.originalname}" added to delivery form for "${deliveryForm.name}"`,
      contentId: deliveryForm._id,
      leadId: deliveryForm.leadId,
      metadata: {
        documentName: req.file.originalname,
        fileName: req.file.originalname,
        deliveryFormName: deliveryForm.name,
        totalDocuments: deliveryForm.documents.length
      }
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Document added successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding document',
      error: error.message
    });
  }
};

// Remove document from delivery form
export const removeDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const deliveryForm = await DeliveryForm.findById(id);
    
    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    // Find the document index
    const documentIndex = deliveryForm.documents.findIndex(doc => doc._id.toString() === docId);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const removedDocument = deliveryForm.documents[documentIndex];

    // Remove the document from the array
    deliveryForm.documents.splice(documentIndex, 1);
    await deliveryForm.save();

    // Create activity for document removal
    const activity = new Activity({
      user: req.user?._id || deliveryForm.soldBy,
      type: 'delivery_form_document_removed',
      content: `Document "${removedDocument.name}" removed from delivery form for "${deliveryForm.name}"`,
      contentId: deliveryForm._id,
      leadId: deliveryForm.leadId,
      metadata: {
        documentName: removedDocument.name,
        fileName: removedDocument.fileName,
        deliveryFormName: deliveryForm.name,
        totalDocuments: deliveryForm.documents.length
      }
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error) {
    console.error('Remove document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing document',
      error: error.message
    });
  }
};

// Get all delivery forms
export const getAllDeliveryForms = async (req, res) => {
  try {

    
    const filter = {};
    if(req.user.role !== 'Super Admin') filter.createdBy = req.user.id;
    
    const deliveryForms = await DeliveryForm.find(filter)
        .populate('leadId', 'name email status')
        .populate('soldBy', 'username email')
        .populate({
      path: 'car',
      select: 'year color price', // Include these fields from the Car document
      populate: [
        { path: 'brand', select: 'make' },   // Populate brand from makeModel
        { path: 'model', select: 'name' },   // Populate model from CarModel
        { path: 'variant', select: 'name' }  // Populate variant from CarVariant
      ]
    })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Delivery forms fetched successfully',
      data: deliveryForms
    });
  } catch (error) {
    console.error('Get all delivery forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery forms',
      error: error.message
    });
  }
};

// Get delivery form by ID
export const getDeliveryFormById = async (req, res) => {
  try {
    const deliveryForm = await DeliveryForm.findById(req.params.id)
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate('car')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery form fetched successfully',
      data: deliveryForm
    });
  } catch (error) {
    console.error('Get delivery form by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery form',
      error: error.message
    });
  }
};

// Delete delivery form
export const deleteDeliveryForm = async (req, res) => {
  try {
    const deliveryForm = await DeliveryForm.findById(req.params.id);

    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    // Store data for activity before deletion
    const deletedData = {
      name: deliveryForm.name,
      deliveryStatus: deliveryForm.deliveryStatus,
      documentsCount: deliveryForm.documents.length
    };

    await DeliveryForm.findByIdAndDelete(req.params.id);

    // Create activity for delivery form deletion
    const activity = new Activity({
      user: req.user?._id || deliveryForm.soldBy,
      type: 'delivery_form_deleted',
      content: `Delivery form deleted for "${deliveryForm.name}"`,
      contentId: deliveryForm._id,
      leadId: deliveryForm.leadId,
      metadata: deletedData
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Delivery form deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery form',
      error: error.message
    });
  }
};

// Other controller functions...
export const getDeliveryFormsByLead = async (req, res) => {
  try {
    const deliveryForms = await DeliveryForm.find({ leadId: req.params.leadId })
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate('car')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Delivery forms fetched successfully',
      data: deliveryForms
    });
  } catch (error) {
    console.error('Get delivery forms by lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery forms',
      error: error.message
    });
  }
};

export const getDeliveryFormsByStatus = async (req, res) => {
  try {
    const deliveryForms = await DeliveryForm.find({ deliveryStatus: req.params.status })
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate('car')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Delivery forms fetched successfully',
      data: deliveryForms
    });
  } catch (error) {
    console.error('Get delivery forms by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery forms',
      error: error.message
    });
  }
};

export const getOverdueDeliveryForms = async (req, res) => {
  try {
    const today = new Date();
    const deliveryForms = await DeliveryForm.find({
      expectedCompletionDate: { $lt: today },
      deliveryStatus: 'Not Delivered'
    })
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate('car')
      .sort({ expectedCompletionDate: 1 });

    res.json({
      success: true,
      message: 'Overdue delivery forms fetched successfully',
      data: deliveryForms
    });
  } catch (error) {
    console.error('Get overdue delivery forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue delivery forms',
      error: error.message
    });
  }
};

export const getDeliveryStats = async (req, res) => {
  try {
    const totalForms = await DeliveryForm.countDocuments();
    const deliveredForms = await DeliveryForm.countDocuments({ deliveryStatus: 'Delivered' });
    const pendingForms = await DeliveryForm.countDocuments({ deliveryStatus: 'Not Delivered' });
    const rtoTransferred = await DeliveryForm.countDocuments({ rtoTransferred: 'Yes' });

    const today = new Date();
    const overdueForms = await DeliveryForm.countDocuments({
      expectedCompletionDate: { $lt: today },
      deliveryStatus: 'Not Delivered'
    });

    res.json({
      success: true,
      message: 'Delivery stats fetched successfully',
      data: {
        totalForms,
        deliveredForms,
        pendingForms,
        rtoTransferred,
        overdueForms
      }
    });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery stats',
      error: error.message
    });
  }
};

// Update delivery status with activity tracking
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, actualDeliveryDate } = req.body;

    const deliveryForm = await DeliveryForm.findById(id);

    if (!deliveryForm) {
      return res.status(404).json({
        success: false,
        message: 'Delivery form not found'
      });
    }

    const previousStatus = deliveryForm.deliveryStatus;

    // Update fields
    if (deliveryStatus) deliveryForm.deliveryStatus = deliveryStatus;
    if (actualDeliveryDate) deliveryForm.actualDeliveryDate = actualDeliveryDate;

    // Set updatedBy if user is authenticated
    if (req.user) {
      deliveryForm.updatedBy = req.user.id;
    }

    const updatedForm = await deliveryForm.save();

    // Populate the updated form
    const populatedForm = await DeliveryForm.findById(updatedForm._id)
      .populate('leadId', 'name email status')
      .populate('soldBy', 'username email')
      .populate('car')
      .populate('updatedBy', 'username email');

    // Create activity for status update
    const activity = new Activity({
      user: req.user?._id || deliveryForm.soldBy,
      type: 'delivery_status_updated',
      content: `Delivery status changed from "${previousStatus}" to "${deliveryStatus}" for "${deliveryForm.name}"`,
      contentId: deliveryForm._id,
      leadId: deliveryForm.leadId,
      metadata: {
        previousStatus,
        newStatus: deliveryStatus,
        actualDeliveryDate,
        deliveryFormName: deliveryForm.name
      }
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: populatedForm
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: error.message
    });
  }
};