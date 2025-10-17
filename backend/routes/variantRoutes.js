import express from 'express';
import { createVariant, getAllVariants, updateVariant, deleteVariant, getVariantsByModelId } from '../controllers/variantController.js';
const variantRoutes = express.Router();
variantRoutes.get('/all', getAllVariants);
variantRoutes.post('/add', createVariant);
variantRoutes.delete('/delete/:id', deleteVariant);
variantRoutes.put('/update/:id', updateVariant);
variantRoutes.get('/model/:modelId', getVariantsByModelId);

export default variantRoutes;
 