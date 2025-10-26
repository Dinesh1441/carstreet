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
import { userAuth } from '../middleware/auth.js';
const sellopportunityRoute = express.Router();

// File upload route - FIXED: removed duplicate import and used correct middleware
sellopportunityRoute.post('/upload', userAuth, uploadMiddleware, handleUploadError, uploadSellOpportunityFiles);

// CRUD routes
sellopportunityRoute.post('/add', userAuth, createSellOpportunity);
sellopportunityRoute.get('/all', userAuth, getAllSellOpportunities);
sellopportunityRoute.get('/get/:id', userAuth, getSellOpportunityById);
sellopportunityRoute.put('/update/:id', userAuth, updateSellOpportunity);
sellopportunityRoute.delete('/delete/:id', userAuth, deleteSellOpportunity);

// Special routes
sellopportunityRoute.get('/lead/:leadId', getSellOpportunitiesByLead);
sellopportunityRoute.get('/owner/:ownerId', getSellOpportunitiesByOwner);
sellopportunityRoute.put('/status/:id', updateOpportunityStatus);
sellopportunityRoute.get('/stats', getOpportunityStats);

export default sellopportunityRoute;