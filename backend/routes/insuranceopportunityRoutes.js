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
import { userAuth } from '../middleware/auth.js';

const insuranceOpportunityRoutes = express.Router();

insuranceOpportunityRoutes.post('/add', userAuth, createInsuranceOpportunity);
insuranceOpportunityRoutes.get('/all', userAuth, getAllInsuranceOpportunities);
insuranceOpportunityRoutes.get('/stats', userAuth, getInsuranceOpportunityStats);
insuranceOpportunityRoutes.get('/lead/:leadId', userAuth, getInsuranceOpportunitiesByLeadId);
insuranceOpportunityRoutes.get('/:id', userAuth, getInsuranceOpportunityById);
insuranceOpportunityRoutes.put('/:id', userAuth, updateInsuranceOpportunity);
insuranceOpportunityRoutes.delete('/:id', userAuth, deleteInsuranceOpportunity);

export default insuranceOpportunityRoutes;