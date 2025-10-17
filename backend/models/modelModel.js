import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'makeModel',
    required: true,
  },
} , { timestamps: true });

const CarModel = mongoose.model.CarModel || mongoose.model('CarModel', modelSchema);

export default CarModel;
