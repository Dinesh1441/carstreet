import express from 'express';

import { createState, getAllStates, updateState, deleteState } from '../controllers/stateController.js';

const stateRoutes = express.Router();

stateRoutes.get('/all', getAllStates);
stateRoutes.post('/add', createState);
stateRoutes.delete('/delete/:id', deleteState);
stateRoutes.put('/update/:id', updateState);

export default stateRoutes;