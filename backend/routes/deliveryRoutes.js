import express from 'express';
import {
  createDeliveryForm,
  getAllDeliveryForms,
  getDeliveryFormById,
  getDeliveryFormsByLead,
  updateDeliveryForm,
  addDocument,
  removeDocument,
  getDeliveryFormsByStatus,
  getOverdueDeliveryForms,
  deleteDeliveryForm,
  getDeliveryStats
} from '../controllers/deliveryController.js';

import { uploadDeliveryFile, handleUploadError, processUploadedFile  } from '../middleware/multer.js';

const deliveryRoutes = express.Router();

deliveryRoutes.route('/')
  .post(uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), createDeliveryForm)
  .get(getAllDeliveryForms);

deliveryRoutes.route('/dashboard/stats')
  .get(getDeliveryStats);

deliveryRoutes.route('/lead/:leadId')
  .get(getDeliveryFormsByLead);

deliveryRoutes.route('/status/:status')
  .get(getDeliveryFormsByStatus);

deliveryRoutes.route('/overdue')
  .get(getOverdueDeliveryForms);

deliveryRoutes.route('/:id')
  .get(getDeliveryFormById)
  .put(uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), updateDeliveryForm)
  .delete(deleteDeliveryForm);

deliveryRoutes.route('/:id/documents')
  .post(uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), addDocument);

deliveryRoutes.route('/:id/documents/:docId')
  .delete(removeDocument);

export default deliveryRoutes;