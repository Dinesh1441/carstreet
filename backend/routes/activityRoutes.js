import express from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  getActivitiesByUser,
  getActivitiesByType,
  updateActivity,
  deleteActivity,
  deleteUserActivities,
  getActivityStats,
  searchActivities
} from '../controllers/activityController.js';

const activityRoutes = express.Router();

activityRoutes.post('/', createActivity);
activityRoutes.get('/', getActivities);
activityRoutes.get('/search', searchActivities);
activityRoutes.get('/stats', getActivityStats);
activityRoutes.get('/user/:userId', getActivitiesByUser);
activityRoutes.get('/type/:type', getActivitiesByType);
activityRoutes.get('/:id', getActivityById);
activityRoutes.put('/:id', updateActivity);
activityRoutes.delete('/:id', deleteActivity);
activityRoutes.delete('/user/:userId', deleteUserActivities);

export default activityRoutes;