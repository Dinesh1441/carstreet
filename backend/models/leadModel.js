import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, default : '' },
  phone: { type: String, required: true },
  mobile: { type: String, default: '' },
  profileImage: { type: String, default: null },
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  cityName: { type: String, default: '' },
  state: { type: String, default: '' },
  stateName: { type: String, default: '' },
  zip: { type: String, default: '' },
  country: { type: String, default: '' },
  leadSource: { type: String, default: '' },
  twitter: { type: String, default: '' },
  facebook: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  skype: { type: String, default: '' },
  gtalk: { type: String, default: '' },
  googlePlus: { type: String, default: '' },
  callCount: { type: Number, default: 0 },
  carMake: { type: String, default: '' },
  Model: { type: String, default: '' },
  variant: { type: String, default: '' },
  status: { type: String, default: 'New Lead' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LeadModel = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export default LeadModel;
