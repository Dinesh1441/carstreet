import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  secret: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    default: ['full']
  },
  rateLimit: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate API key and secret
apiKeySchema.statics.generateKey = function() {
  const apiKey = `sk_${crypto.randomBytes(16).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  return { apiKey, secret };
};

// Check if API key is expired
apiKeySchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

export default mongoose.model('ApiKey', apiKeySchema);