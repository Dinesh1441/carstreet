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
import { userAuth } from '../middleware/auth.js';

const deliveryRoutes = express.Router();

deliveryRoutes.route('/')
  .post(userAuth, uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), createDeliveryForm)
  .get(userAuth, getAllDeliveryForms);

deliveryRoutes.route('/dashboard/stats').get(userAuth, getDeliveryStats);

deliveryRoutes.route('/lead/:leadId')
  .get(userAuth, getDeliveryFormsByLead);

deliveryRoutes.route('/status/:status')
  .get(userAuth, getDeliveryFormsByStatus);

deliveryRoutes.route('/overdue')
  .get(userAuth, getOverdueDeliveryForms);

deliveryRoutes.route('/:id')
  .get(userAuth, getDeliveryFormById)
  .put(userAuth, uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), updateDeliveryForm)
  .delete(userAuth, deleteDeliveryForm);

deliveryRoutes.route('/:id/documents')
  .post(userAuth, uploadDeliveryFile, handleUploadError, processUploadedFile('deliveryFiles'), addDocument);

deliveryRoutes.route('/:id/documents/:docId')
  .delete(userAuth, removeDocument);

export default deliveryRoutes;