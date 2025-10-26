import express from 'express';
import {
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  validateApiKey
} from '../controllers/apiController.js';
import { userAuth } from '../middleware/auth.js';

const apiRoutes = express.Router();

// All routes except validate are protected
apiRoutes.use(userAuth);

// GET /api/api-keys - Get all API keys
apiRoutes.get('/', getApiKeys);

// // GET /api/api-keys/:id - Get single API key
apiRoutes.get('/:id', getApiKey); 

// POST /api/api-keys - Create new API key
apiRoutes.post('/', createApiKey);

// PUT /api/api-keys/:id - Update API key
apiRoutes.put('/:id', updateApiKey);

// DELETE /api/api-keys/:id - Delete API key
apiRoutes.delete('/:id', deleteApiKey);

// POST /api/api-keys/validate - Validate API key (public)
apiRoutes.post('/validate', validateApiKey);

export default apiRoutes;