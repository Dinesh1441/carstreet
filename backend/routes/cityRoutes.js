import express from 'express';
import {
    createCity,
    getAllCities,
    getCityById,
    updateCity,
    deleteCity,
    getCitiesByState,
    bulkCreateCities,
    searchCities,
    getCityStats,
    getCitiesAdvanced
} from '../controllers/cityController.js';
import { userAuth } from '../middleware/auth.js';

const cityRoutes = express.Router();

// Basic CRUD operations
cityRoutes.post('/add', userAuth, createCity);
cityRoutes.get('/all', userAuth, getAllCities);
cityRoutes.get('/advanced', userAuth, getCitiesAdvanced);
cityRoutes.get('/stats', userAuth, getCityStats);
cityRoutes.get('/search', userAuth, searchCities);
cityRoutes.get('/state/:stateId', userAuth, getCitiesByState);
cityRoutes.get('/:id', userAuth, getCityById);
cityRoutes.put('/:id', userAuth, updateCity);
cityRoutes.delete('/:id', userAuth, deleteCity);

// Bulk operations
cityRoutes.post('/bulk-create', bulkCreateCities);

export default cityRoutes;