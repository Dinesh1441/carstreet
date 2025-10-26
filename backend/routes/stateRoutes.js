import express from 'express';

import { createState, getAllStates, updateState, deleteState } from '../controllers/stateController.js';
import { userAuth } from '../middleware/auth.js';
const stateRoutes = express.Router();

stateRoutes.get('/all', userAuth, getAllStates);
stateRoutes.post('/add', userAuth, createState);
stateRoutes.delete('/delete/:id', userAuth, deleteState);
stateRoutes.put('/update/:id', userAuth, updateState);

export default stateRoutes;