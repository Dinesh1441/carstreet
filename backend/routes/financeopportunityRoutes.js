// routes/financeOpportunityRoutes.js
import express from 'express';
import {
    createFinanceOpportunity,
    getAllFinanceOpportunities,
    getFinanceOpportunityById,
    updateFinanceOpportunity,
    deleteFinanceOpportunity,
    getFinanceOpportunitiesByLeadId
} from '../controllers/financeopportunityController.js';
import { userAuth } from '../middleware/auth.js';

const financeOpportunityRoutes = express.Router();

financeOpportunityRoutes.post('/add', userAuth, createFinanceOpportunity);
financeOpportunityRoutes.get('/all', userAuth, getAllFinanceOpportunities);
financeOpportunityRoutes.get('/lead/:leadId', userAuth, getFinanceOpportunitiesByLeadId);
financeOpportunityRoutes.get('/:id', userAuth, getFinanceOpportunityById);
financeOpportunityRoutes.put('/update/:id', userAuth, updateFinanceOpportunity);
financeOpportunityRoutes.patch('/:id/status', userAuth, updateFinanceOpportunity);
financeOpportunityRoutes.delete('/:id', userAuth, deleteFinanceOpportunity);

export default financeOpportunityRoutes;