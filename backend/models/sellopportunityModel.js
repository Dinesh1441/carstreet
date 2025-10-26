import mongoose from "mongoose";

const sellOpportunitySchema = new mongoose.Schema({
  // 1. PERSONAL DETAIL
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Website', 'Walk-in', 'Reference', 'Social Media', 'Campaign', 'Other']
  },
  status: {
    type: String,
    enum: ['Open', 'Won', 'Lost'],
    default: 'Open'
  },
  stage: {
    type: String,
    required: true,
    enum: ['Fresh Lead', 'Lead', 'Marketing Qualified Lead', 'Purchase Qualified Lead', 'Negotiation']
  },
  email: String,
  phoneNumber: String,
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StateModel"
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  },

  // 2. CAR DETAILS
  monthOfRegistration: String,
  yearOfRegistration: Number,
  monthOfManufacturing: String,
  yearOfManufacturing: Number,
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "makeModel",
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarVariant"
  },
  color: String,
  sunroof: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', '']
  },
  ownership: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '']
  },

  // 3. REGISTRATION & INSURANCE DETAILS
  registrationType: {
    type: String,
    enum: ['Individual', 'Corporate', 'Taxi', '']
  },
  registrationState: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State"
  },
  registrationNumber: String,
  insuranceType: {
    type: String,
    enum: ['Return To Invoice (RTI)', 'Zero Dep', '3rd Party Only', 'Comprehensive / Normal', '']
  },
  insuranceCompany: String,
  insuranceExpiryDate: Date,

  // 4. KILOMETERS AND PRICING
  kilometersDriven: Number,
  expectedSellingPrice: Number,
  documents: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  notes: String,

  // 5. OTHERS
  secondKeyAvailable: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  servicePackage: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  warrantyValidity: {
    type: String,
    enum: ['Normal', 'Extended', 'NA'],
    default: 'Normal'
  },

  // File uploads
  carImages: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rcUpload: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  serviceHistory: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead"
  },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
}, { timestamps: true });

const SellOpportunity = mongoose.models.SellOpportunity || mongoose.model("SellOpportunity", sellOpportunitySchema);

export default SellOpportunity;