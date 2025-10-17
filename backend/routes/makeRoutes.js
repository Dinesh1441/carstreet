import express from 'express';
import { createMake, getAllMakes, updateMake, deleteMake  } from '../controllers/makeController.js';

const makeRoutes = express.Router();

makeRoutes.get('/all', getAllMakes);
makeRoutes.post('/add', createMake);
makeRoutes.delete('/delete/:id', deleteMake);
makeRoutes.put('/update/:id', updateMake);


export default makeRoutes;
