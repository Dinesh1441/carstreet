import express from 'express';
import {
    createSellOpportunity,
    getAllSellOpportunities,
    getSellOpportunityById,
    updateSellOpportunity,
    deleteSellOpportunity,
    getSellOpportunitiesByLead,
    getSellOpportunitiesByOwner,
    updateOpportunityStatus,
    getOpportunityStats,
    uploadSellOpportunityFiles
} from '../controllers/sellopportunityController.js';
import { uploadSellOpportunityFiles as uploadMiddleware, handleUploadError } from '../middleware/multer.js';

const sellopportunityRoute = express.Router();

// File upload route - FIXED: removed duplicate import and used correct middleware
sellopportunityRoute.post('/upload', uploadMiddleware, handleUploadError, uploadSellOpportunityFiles);

// CRUD routes
sellopportunityRoute.post('/add', createSellOpportunity);
sellopportunityRoute.get('/all', getAllSellOpportunities);
sellopportunityRoute.get('/get/:id', getSellOpportunityById);
sellopportunityRoute.put('/update/:id', updateSellOpportunity);
sellopportunityRoute.delete('/delete/:id', deleteSellOpportunity);

// Special routes
sellopportunityRoute.get('/lead/:leadId', getSellOpportunitiesByLead);
sellopportunityRoute.get('/owner/:ownerId', getSellOpportunitiesByOwner);
sellopportunityRoute.put('/status/:id', updateOpportunityStatus);
sellopportunityRoute.get('/stats', getOpportunityStats);

export default sellopportunityRoute;