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

const cityRoutes = express.Router();

// Basic CRUD operations
cityRoutes.post('/add', createCity);
cityRoutes.get('/all', getAllCities);
cityRoutes.get('/advanced', getCitiesAdvanced);
cityRoutes.get('/stats', getCityStats);
cityRoutes.get('/search', searchCities);
cityRoutes.get('/state/:stateId', getCitiesByState);
cityRoutes.get('/:id', getCityById);
cityRoutes.put('/:id', updateCity);
cityRoutes.delete('/:id', deleteCity);

// Bulk operations
cityRoutes.post('/bulk-create', bulkCreateCities);

export default cityRoutes;