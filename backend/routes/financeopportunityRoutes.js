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

const financeOpportunityRoutes = express.Router();

financeOpportunityRoutes.post('/add', createFinanceOpportunity);
financeOpportunityRoutes.get('/all', getAllFinanceOpportunities);
financeOpportunityRoutes.get('/lead/:leadId', getFinanceOpportunitiesByLeadId);
financeOpportunityRoutes.get('/:id', getFinanceOpportunityById);
financeOpportunityRoutes.put('/update/:id', updateFinanceOpportunity);
financeOpportunityRoutes.patch('/:id/status', updateFinanceOpportunity);
financeOpportunityRoutes.delete('/:id', deleteFinanceOpportunity);

export default financeOpportunityRoutes;