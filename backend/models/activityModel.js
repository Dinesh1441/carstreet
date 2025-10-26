
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
  contentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  metadata: { type: Object, default: {} }
} , { timestamps: true });

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
