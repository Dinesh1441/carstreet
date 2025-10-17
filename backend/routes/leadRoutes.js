// routes/leadRoutes.js
import express from 'express';
import {  
  addLead, 
  getLeadById, 
  getLeads, 
  updateLead, 
  deleteLead,
  exportLeads  // Add this import
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

const leadRoutes = express.Router();

// Basic CRUD routes
leadRoutes.post('/all', getLeads);
leadRoutes.get('/get/:id', getLeadById);
leadRoutes.post('/add', addLead);
leadRoutes.put('/update/:id', updateLead);
leadRoutes.delete('/delete/:id', deleteLead);

// Export route - ADD THIS
leadRoutes.post('/export', exportLeads);

// Image upload routes
leadRoutes.post(
  '/upload', 
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  uploadLeadImage
);

leadRoutes.post(
  '/add-with-image', 
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  addLeadWithImage
);

leadRoutes.put(
  '/update-with-image/:id', 
  uploadLeadImageMiddleware, 
  handleUploadError, 
  processUploadedFile('leads'), 
  updateLeadWithImage
);

leadRoutes.delete('/delete-image/:id', deleteLeadImage);

export default leadRoutes;