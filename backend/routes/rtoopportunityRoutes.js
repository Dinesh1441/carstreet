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

const rtoOpportunityRoutes = express.Router();

rtoOpportunityRoutes.post('/add', createRtoOpportunity);
rtoOpportunityRoutes.get('/all', getAllRtoOpportunities);
rtoOpportunityRoutes.get('/stats', getRtoOpportunityStats);
rtoOpportunityRoutes.get('/counts', getRtoOpportunityCounts);
rtoOpportunityRoutes.get('/process/:processType', getRtoOpportunitiesByProcess);
rtoOpportunityRoutes.get('/lead/:leadId', getRtoOpportunitiesByLeadId);
rtoOpportunityRoutes.get('/:id', getRtoOpportunityById);
rtoOpportunityRoutes.put('/:id', updateRtoOpportunity);
rtoOpportunityRoutes.delete('/:id', deleteRtoOpportunity);

export default rtoOpportunityRoutes;