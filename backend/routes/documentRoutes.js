import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  viewDocument,
  updateDocument,
  deleteDocument,
  hardDeleteDocument,
  getDocumentsByLead,
  serveDocument
} from '../controllers/documentController.js';

import { uploadDocuments, handleUploadError, processUploadedFile } from '../middleware/multer.js';
import { userAuth } from '../middleware/auth.js';
const documentRoutes = express.Router();


// Document routes
documentRoutes.post(
  '/upload',
  userAuth,
  uploadDocuments, 
  handleUploadError,
  processUploadedFile('document'),
  uploadDocument
);

documentRoutes.get('/all', userAuth, getDocuments);
documentRoutes.get('/lead/:leadId', userAuth, getDocumentsByLead);
documentRoutes.get('/:id', userAuth, getDocumentById);
documentRoutes.get('/:id/download', userAuth, downloadDocument);
documentRoutes.get('/:id/view', userAuth, viewDocument);
documentRoutes.get('/file/:filename', userAuth, serveDocument); // Serve file directly by filename
documentRoutes.put('/:id', userAuth, updateDocument);
documentRoutes.delete('/:id', userAuth, deleteDocument);
documentRoutes.delete('/:id/hard', userAuth, hardDeleteDocument);

export default documentRoutes;