import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: { 
    type: String,
    enum: ['Super Admin', 'Sales Executive', 'Finance Department', 'Insurance Department', 'RTO Department'],
    default: 'Team Member'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
   lastAssignedAt: {
    type: Date,
    default: null
  },
  assignedLeadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;