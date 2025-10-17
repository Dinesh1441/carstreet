// models/DeliveryForm.js
import mongoose from 'mongoose';

const deliveryFormSchema = new mongoose.Schema({
  // Lead Information
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Sales Information
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sales person is required']
  },
  
  // Car Information
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car selection is required']
  },
  
  // Delivery Information
  deliveryStatus: {
    type: String,
    enum: ['Delivered', 'Not Delivered'],
    default: 'Not Delivered',
    required: true
  },
  rtoTransferred: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No',
    required: true
  },
  expectedCompletionDate: {
    type: Date,
    required: [true, 'Expected completion date is required']
  },

  // Documents
  documents: [{
    name: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  // Timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
deliveryFormSchema.index({ leadId: 1 });
deliveryFormSchema.index({ soldBy: 1 });
deliveryFormSchema.index({ car: 1 });
deliveryFormSchema.index({ deliveryStatus: 1 });
deliveryFormSchema.index({ expectedCompletionDate: 1 });
deliveryFormSchema.index({ createdAt: -1 });

// Virtual for formatted expected completion date
deliveryFormSchema.virtual('formattedExpectedDate').get(function() {
  return this.expectedCompletionDate ? this.expectedCompletionDate.toISOString().split('T')[0] : '';
});

// Virtual for formatted actual delivery date
deliveryFormSchema.virtual('formattedActualDate').get(function() {
  return this.actualDeliveryDate ? this.actualDeliveryDate.toISOString().split('T')[0] : '';
});

// Method to check if delivery is overdue
deliveryFormSchema.methods.isOverdue = function() {
  if (this.deliveryStatus === 'Delivered' || this.deliveryStatus === 'RTO Transferred & Handed Over') {
    return false;
  }
  return this.expectedCompletionDate < new Date();
};

// Static method to get delivery forms by status
deliveryFormSchema.statics.getByStatus = function(status) {
  return this.find({ deliveryStatus: status }).populate('soldBy car leadId');
};

// Static method to get delivery forms by lead
deliveryFormSchema.statics.getByLead = function(leadId) {
  return this.find({ leadId }).populate('soldBy car').sort({ createdAt: -1 });
};

// Middleware to update actualDeliveryDate when status changes to delivered
deliveryFormSchema.pre('save', function(next) {
  if (this.isModified('deliveryStatus') && 
      (this.deliveryStatus === 'Delivered' || this.deliveryStatus === 'RTO Transferred & Handed Over') && 
      !this.actualDeliveryDate) {
    this.actualDeliveryDate = new Date();
  }
  next();
});

const DeliveryForm = mongoose.models.DeliveryForm || mongoose.model('DeliveryForm', deliveryFormSchema);

export default DeliveryForm;