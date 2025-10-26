import ApiKey from '../models/apiModel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Get all API keys for user
export const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find()
      // .select('-secret')
      .sort({ createdAt: -1 });

    res.json({
      status: "success",
      data: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: 'Error fetching API keys'
    });
  }
};

// Get single API key
export const getApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findById(id).select('-secret');

    if (!apiKey) {
      return res.status(404).json({
        status: "error",
        message: 'API key not found'
      });
    }

    res.json({
      status: "success",
      data: apiKey
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: "error",
        message: 'Invalid API key ID format'
      });
    }

    res.status(500).json({
      status: "error",
      message: 'Error fetching API key'
    });
  }
};

// ... other imports

// Create new API key
export const createApiKey = async (req, res) => {
  try {
    const { name, expiresAt } = req.body;

    // Generate API key and secret
    const apiKey = `sk_${crypto.randomBytes(16).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');

    const newApiKey = new ApiKey({
      name,
      apiKey,
      secret,
      expiresAt: expiresAt || null,
      createdBy: req.user.id
    });

    await newApiKey.save();

    res.status(201).json({
      status: "success",
      message: 'API key created successfully',
      data: {
        ...newApiKey.toObject(),
        secret // Return secret only once
      }
    });
  } catch (error) {
    // ... error handling
  }
};

// Update API key
export const updateApiKey = async (req, res) => {
  try {
    const { name, expiresAt, status } = req.body;

    const apiKey = await ApiKey.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        status: "error",
        message: 'API key not found'
      });
    }

    // Update fields
    if (name) apiKey.name = name;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt;
    if (status) apiKey.status = status;

    await apiKey.save();

    res.json({
      status: "success",
      message: 'API key updated successfully',
      data: apiKey
    });
  } catch (error) {
    // ... error handling
  }
};
// Delete API key
export const deleteApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        status: "error",
        message: 'API key not found'
      });
    }

    await ApiKey.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      message: 'API key deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: 'Error deleting API key'
    });
  }
};

// Validate API key and return JWT
export const validateApiKey = async (req, res) => {
  try {
    const { apiKey, secret } = req.body;

    if (!apiKey || !secret) {
      return res.status(400).json({
        status: "error",
        message: 'API key and secret are required'
      });
    }

    const apiKeyDoc = await ApiKey.findOne({ apiKey });

    if (!apiKeyDoc || apiKeyDoc.secret !== secret) {
      return res.status(401).json({
        status: "error",
        message: 'Invalid API key or secret'
      });
    }

    if (apiKeyDoc.status !== 'active') {
      return res.status(401).json({
        status: "error",
        message: 'API key is not active'
      });
    }

    if (apiKeyDoc.isExpired()) {
      return res.status(401).json({
        status: "error",
        message: 'API key has expired'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        apiKeyId: apiKeyDoc._id,
        permissions: apiKeyDoc.permissions,
        rateLimit: apiKeyDoc.rateLimit
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: "success",
      data: {
        token,
        permissions: apiKeyDoc.permissions,
        rateLimit: apiKeyDoc.rateLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: 'Error validating API key'
    });
  }
};