import mongoose from 'mongoose';

const makeSchema = new mongoose.Schema({
  make: { type: String, required: true },
}
, { timestamps: true });

const makeModel = mongoose.model.makeModel || mongoose.model('makeModel', makeSchema);

export default makeModel;
