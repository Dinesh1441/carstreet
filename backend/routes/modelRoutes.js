import express from 'express';

import { createModel, getAllModels, updateModel, deleteModel, getModelsByMakeId } from '../controllers/modelController.js';
import { userAuth } from '../middleware/auth.js';
import { apiAuth } from '../middleware/apiAuth.js';
const modelRoutes = express.Router();
modelRoutes.get('/get', apiAuth, getAllModels);
modelRoutes.get('/all', userAuth, getAllModels);
modelRoutes.post('/add', userAuth, createModel);
modelRoutes.delete('/delete/:id', userAuth, deleteModel);
modelRoutes.put('/update/:id', userAuth, updateModel);
modelRoutes.get('/make/:makeId', userAuth, getModelsByMakeId); // New route

export default modelRoutes;
