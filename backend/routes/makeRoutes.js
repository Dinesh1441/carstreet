import express from 'express';
import { createMake, getAllMakes, updateMake, deleteMake  } from '../controllers/makeController.js';
import { userAuth } from '../middleware/auth.js';

const makeRoutes = express.Router();

makeRoutes.get('/all', userAuth, getAllMakes);
makeRoutes.post('/add', userAuth, createMake);
makeRoutes.delete('/delete/:id', userAuth, deleteMake);
makeRoutes.put('/update/:id', userAuth, updateMake);

export default makeRoutes;
