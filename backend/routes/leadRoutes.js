// routes/leadRoutes.js
import express from 'express';
import {  
  addLead, 
  getLeadById, 
  getLeads, 
  updateLead, 
  deleteLead,
  exportLeads,  // Add this import
  getLeadsByOwner
} from '../controllers/leadController.js';
import { 
  uploadLeadImage, 
  updateLeadWithImage, 
  addLeadWithImage, 
  deleteLeadImage 
} from '../controllers/leadUploadController.js';
import { 
  uploadLeadProfileImage as uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile 
} from '../middleware/multer.js';

import { userAuth } from '../middleware/auth.js';
import { apiAuth } from '../middleware/apiAuth.js';

const leadRoutes = express.Router();

// Basic CRUD routes
leadRoutes.post('/all', userAuth, getLeads);
leadRoutes.post('/user', userAuth, getLeadsByOwner);
leadRoutes.get('/get/:id', userAuth,  getLeadById);
leadRoutes.post('/add', userAuth, addLead);
leadRoutes.put('/update/:id', userAuth, updateLead);
leadRoutes.delete('/delete/:id', userAuth, deleteLead);


//Api Route 
leadRoutes.post('/create', apiAuth, addLead);

// Export route - ADD THIS
leadRoutes.post('/export', userAuth, exportLeads);

// Image upload routes
leadRoutes.post(
  '/upload', 
  userAuth,
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  uploadLeadImage
);

leadRoutes.post(
  '/add-with-image',
  userAuth, 
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  addLeadWithImage
);

leadRoutes.put(
  '/update-with-image/:id', 
  userAuth,
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  updateLeadWithImage
);

leadRoutes.delete('/delete-image/:id', userAuth, deleteLeadImage);

export default leadRoutes;