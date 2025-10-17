
import mongoose from 'mongoose';
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: true
  },

} , { timestamps: true });

const CarVariant = mongoose.model.CarVariant || mongoose.model('CarVariant', variantSchema);

export default CarVariant;
