import ApiKey from '../models/apiModel.js';

// Middleware to authenticate API requests using API Key and Secret
export const apiAuth = async (req, res, next) => {
  try {
    // Get API Key and Secret from headers
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    // Check if both API Key and Secret are provided
    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        status: "error",
        message: 'API Key and Secret are required'
      });
    }

    // Find API key in database
    const apiKeyDoc = await ApiKey.findOne({ apiKey });
    
    // Check if API key exists
    if (!apiKeyDoc) {
      return res.status(401).json({
        status: "error",
        message: 'Invalid API Key'
      });
    }

    // Verify API secret
    if (apiKeyDoc.secret !== apiSecret) {
      return res.status(401).json({
        status: "error",
        message: 'Invalid API Secret'
      });
    }

    // Check if API key is active
    if (apiKeyDoc.status !== 'active') {
      return res.status(401).json({
        status: "error",
        message: 'API Key is not active'
      });
    }

    // Check if API key is expired
    if (apiKeyDoc.isExpired()) {
      // Update status to expired
      apiKeyDoc.status = 'inactive';
      await apiKeyDoc.save();
      
      return res.status(401).json({
        status: "error",
        message: 'API Key has expired'
      });
    }

    // Increment usage count and update last used
    apiKeyDoc.lastUsed = new Date();
    apiKeyDoc.usageCount += 1;
    await apiKeyDoc.save();

    // Add API key info to request
    req.apiKey = {
      id: apiKeyDoc._id,
      name: apiKeyDoc.name,
      permissions: apiKeyDoc.permissions,
      rateLimit: apiKeyDoc.rateLimit
    };

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({
      status: "error",
      message: 'Server error during API authentication'
    });
  }
};

// Middleware to check permissions
export const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        status: "error",
        message: 'Authentication required'
      });
    }

    // Check if API key has full access or the specific permission
    if (!req.apiKey.permissions.includes('full') && 
        !req.apiKey.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        status: "error",
        message: `Insufficient permissions. Required: ${requiredPermission}`
      });
    }

    next();
  };
};

// Rate limiting middleware
export const rateLimit = (req, res, next) => {
  if (!req.apiKey) {
    return res.status(401).json({
      status: "error",
      message: 'Authentication required'
    });
  }

  // Here you can implement rate limiting logic based on req.apiKey.rateLimit
  // For now, we'll just pass through
  // You can integrate with express-rate-limit or implement custom logic
  
  next();
};