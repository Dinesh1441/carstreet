import express from 'express';

import { createModel, getAllModels, updateModel, deleteModel, getModelsByMakeId } from '../controllers/modelController.js';

const modelRoutes = express.Router();
modelRoutes.get('/all', getAllModels);
modelRoutes.post('/add', createModel);
modelRoutes.delete('/delete/:id', deleteModel);
modelRoutes.put('/update/:id', updateModel);
modelRoutes.get('/make/:makeId', getModelsByMakeId); // New route

export default modelRoutes;
