// routes/dashboardRoutes.js
import express from 'express';
import { getUserDashboard, getDashboardSummary } from '../controllers/salesDashboard.js';
import { userAuth } from '../middleware/auth.js';

const dashboardRoutes = express.Router();

dashboardRoutes.get('/user-dashboard', userAuth, getUserDashboard);
dashboardRoutes.get('/dashboard-summary', userAuth, getDashboardSummary);

export default dashboardRoutes; 