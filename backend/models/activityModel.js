
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

activitySchema.post('save', function (doc) {
  try {
    // Access the global socket.io instance if available
    if (global.io) {
      global.io.emit('activity_created', {
        activity: doc,
        message: 'New activity created'
      });
      console.log('Socket event emitted: activity_created');
    } else {
      console.warn('Socket.io instance not found (global.io missing)');
    }
  } catch (err) {
    console.error('Error emitting socket event:', err);
  }
});


const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
