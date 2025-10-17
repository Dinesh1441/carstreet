import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const StateModel = mongoose.models.StateModel || mongoose.model('StateModel', stateSchema);

export default StateModel;