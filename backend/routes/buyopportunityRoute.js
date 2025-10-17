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

const buyopportunityRoutes = express.Router();

// Add your routes here
buyopportunityRoutes.post('/add', createBuyOpportunity);
buyopportunityRoutes.get('/all', getAllBuyOpportunities);
buyopportunityRoutes.get('/stats', getOpportunityStats);
buyopportunityRoutes.get('/lead/:leadId', getBuyOpportunitiesByLead);
buyopportunityRoutes.get('/owner/:ownerId', getBuyOpportunitiesByOwner);
buyopportunityRoutes.get('/:id', getBuyOpportunityById);
buyopportunityRoutes.put('/:id', updateBuyOpportunity);
buyopportunityRoutes.patch('/:id/status', updateOpportunityStatus);
buyopportunityRoutes.delete('/:id', deleteBuyOpportunity);




export default buyopportunityRoutes;