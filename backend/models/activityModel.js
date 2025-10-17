
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  metadata: { type: Object, default: {} }
} , { timestamps: true });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
