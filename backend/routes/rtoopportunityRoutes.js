// routes/rtoOpportunityRoutes.js
import express from 'express';
import {
    createRtoOpportunity,
    getAllRtoOpportunities,
    getRtoOpportunityById,
    updateRtoOpportunity,
    deleteRtoOpportunity,
    getRtoOpportunitiesByLeadId,
    getRtoOpportunityStats,
    getRtoOpportunitiesByProcess,
    getRtoOpportunityCounts
} from '../controllers/rtoopportunityController.js';
import { userAuth } from '../middleware/auth.js';

const rtoOpportunityRoutes = express.Router();

rtoOpportunityRoutes.post('/add', userAuth, createRtoOpportunity);
rtoOpportunityRoutes.get('/all', userAuth, getAllRtoOpportunities);
rtoOpportunityRoutes.get('/stats', userAuth, getRtoOpportunityStats);
rtoOpportunityRoutes.get('/counts', userAuth, getRtoOpportunityCounts);
rtoOpportunityRoutes.get('/process/:processType', userAuth, getRtoOpportunitiesByProcess);
rtoOpportunityRoutes.get('/lead/:leadId', userAuth, getRtoOpportunitiesByLeadId);
rtoOpportunityRoutes.get('/:id', userAuth, getRtoOpportunityById);
rtoOpportunityRoutes.put('/:id', userAuth, updateRtoOpportunity);
rtoOpportunityRoutes.delete('/:id', userAuth, deleteRtoOpportunity);

export default rtoOpportunityRoutes;