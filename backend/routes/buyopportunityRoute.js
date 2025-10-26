import express from 'express';
import {
    // getAllBuyOpportunities, 
    createBuyOpportunity, 
     getAllBuyOpportunities,
    getBuyOpportunityById,
    updateBuyOpportunity,
    deleteBuyOpportunity,
    getBuyOpportunitiesByLead,
    getBuyOpportunitiesByOwner,
    updateOpportunityStatus,
    getOpportunityStats
} from '../controllers/buyopportunityController.js';

import {  userAuth } from '../middleware/auth.js';


const buyopportunityRoutes = express.Router();

// Add your routes here
buyopportunityRoutes.post('/add', userAuth, createBuyOpportunity);
buyopportunityRoutes.get('/all', userAuth, getAllBuyOpportunities);
buyopportunityRoutes.get('/stats', userAuth, getOpportunityStats);
buyopportunityRoutes.get('/lead/:leadId', userAuth, getBuyOpportunitiesByLead);
buyopportunityRoutes.get('/owner/:ownerId',userAuth, getBuyOpportunitiesByOwner);
buyopportunityRoutes.get('/:id', userAuth, getBuyOpportunityById);
buyopportunityRoutes.put('/:id', userAuth, updateBuyOpportunity);
buyopportunityRoutes.patch('/:id/status', userAuth, updateOpportunityStatus);
buyopportunityRoutes.delete('/:id', userAuth, deleteBuyOpportunity);




export default buyopportunityRoutes;