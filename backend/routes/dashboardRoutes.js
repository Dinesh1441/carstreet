import express from 'express';
import { getDashboardStats, getQuickStats } from '../controllers/dashboardController.js';
import { userAuth } from '../middleware/auth.js';

const dashboardRoutes = express.Router();

dashboardRoutes.get('/stats', userAuth, getDashboardStats);
dashboardRoutes.get('/quick-stats', userAuth, getQuickStats);

export default dashboardRoutes;