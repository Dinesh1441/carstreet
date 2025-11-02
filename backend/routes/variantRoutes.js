import express from 'express';
import { createVariant, getAllVariants, updateVariant, deleteVariant, getVariantsByModelId } from '../controllers/variantController.js';
import { userAuth } from '../middleware/auth.js';
import { apiAuth } from '../middleware/apiAuth.js';

const variantRoutes = express.Router();
variantRoutes.get('/get', apiAuth, getAllVariants);
variantRoutes.get('/all', userAuth, getAllVariants);
variantRoutes.post('/add', userAuth, createVariant);
variantRoutes.delete('/delete/:id', userAuth, deleteVariant);
variantRoutes.put('/update/:id', userAuth, updateVariant);
variantRoutes.get('/model/:modelId', userAuth, getVariantsByModelId);

export default variantRoutes;
