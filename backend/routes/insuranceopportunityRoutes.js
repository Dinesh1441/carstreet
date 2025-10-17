// routes/insuranceOpportunityRoutes.js
import express from 'express';
import {
    createInsuranceOpportunity,
    getAllInsuranceOpportunities,
    getInsuranceOpportunityById,
    updateInsuranceOpportunity,
    deleteInsuranceOpportunity,
    getInsuranceOpportunitiesByLeadId,
    getInsuranceOpportunityStats
} from '../controllers/insuranceopportunityController.js';

const insuranceOpportunityRoutes = express.Router();

insuranceOpportunityRoutes.post('/add', createInsuranceOpportunity);
insuranceOpportunityRoutes.get('/all', getAllInsuranceOpportunities);
insuranceOpportunityRoutes.get('/stats', getInsuranceOpportunityStats);
insuranceOpportunityRoutes.get('/lead/:leadId', getInsuranceOpportunitiesByLeadId);
insuranceOpportunityRoutes.get('/:id', getInsuranceOpportunityById);
insuranceOpportunityRoutes.put('/:id', updateInsuranceOpportunity);
insuranceOpportunityRoutes.delete('/:id', deleteInsuranceOpportunity);

export default insuranceOpportunityRoutes;