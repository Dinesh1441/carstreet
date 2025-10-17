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

const documentRoutes = express.Router();


// Document routes
documentRoutes.post(
  '/upload',
  uploadDocuments,
  handleUploadError,
  processUploadedFile('document'),
  uploadDocument
);

documentRoutes.get('/all', getDocuments);
documentRoutes.get('/lead/:leadId', getDocumentsByLead);
documentRoutes.get('/:id', getDocumentById);
documentRoutes.get('/:id/download', downloadDocument);
documentRoutes.get('/:id/view', viewDocument);
documentRoutes.get('/file/:filename', serveDocument); // Serve file directly by filename
documentRoutes.put('/:id', updateDocument);
documentRoutes.delete('/:id', deleteDocument);
documentRoutes.delete('/:id/hard', hardDeleteDocument);

export default documentRoutes;