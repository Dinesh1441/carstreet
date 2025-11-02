import express from 'express';
import {
  createCar,
    getAllCars,
//   getCarById,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import { uploadCarFiles, handleUploadError, processUploadedFiles } from '../middleware/multer.js';
import { userAuth } from '../middleware/auth.js';
import { apiAuth } from '../middleware/apiAuth.js';

const carRoutes = express.Router();

// Use the new middleware that handles both image and document
carRoutes.post('/create', apiAuth, uploadCarFiles, handleUploadError, processUploadedFiles, createCar);
carRoutes.post('/add', userAuth, uploadCarFiles, handleUploadError, processUploadedFiles, createCar);
carRoutes.get('/', userAuth, getAllCars);
// carRoutes.get('/:id', getCarById);
carRoutes.put('/:id', userAuth, uploadCarFiles, handleUploadError, processUploadedFiles, updateCar);
carRoutes.delete('/delete/:id', userAuth, deleteCar);

export default carRoutes; 