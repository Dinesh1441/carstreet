import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const deliveryFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sold by field is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car field is required']
  },
  deliveryStatus: {
    type: String,
    enum: ['Delivered', 'Not Delivered'],
    default: 'Not Delivered'
  },
  rtoTransferred: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  expectedCompletionDate: {
    type: Date,
    required: [true, 'Expected completion date is required']
  },
  actualDeliveryDate: {
    type: Date
  },
  documents: [documentSchema],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add index for better performance
deliveryFormSchema.index({ name: 1 });
deliveryFormSchema.index({ phoneNumber: 1 });
deliveryFormSchema.index({ deliveryStatus: 1 });
deliveryFormSchema.index({ expectedCompletionDate: 1 });

export default mongoose.model('DeliveryForm', deliveryFormSchema);