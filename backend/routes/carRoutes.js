import express from 'express';
import {
  createCar,
    getAllCars,
//   getCarById,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import { uploadCarFiles, handleUploadError, processUploadedFiles } from '../middleware/multer.js';

const carRoutes = express.Router();

// Use the new middleware that handles both image and document
carRoutes.post('/add', uploadCarFiles, handleUploadError, processUploadedFiles, createCar);

carRoutes.get('/', getAllCars);
// carRoutes.get('/:id', getCarById);
carRoutes.put('/:id', uploadCarFiles, handleUploadError, processUploadedFiles, updateCar);
carRoutes.delete('/delete/:id', deleteCar);

export default carRoutes; 