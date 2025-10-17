import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    // Task Type
    taskType: {
        type: String,
        required: true,
        enum: [
            // APPOINTMENT Types
            "Call Back",
            "Follow-Up", 
            "Inspection",
            "Negotiation",
            "Pitch-Sell opportunity",
            "Test Drive",
            "Vehicle Pick-Up",
            // TODO Types
            "Finance",
            "Insurance",
            "RTO"
        ]
    },

    // Basic Information
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Ownership and Assignment
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Scheduling
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },

    // Reminder Settings
    reminder: {
        type: Boolean,
        default: false
    },
    reminderTime: {
        type: String,
        enum: ["5", "10", "15", "30", "60", "1440"],
        default: "15"
    },
    reminderSent: {
        type: Boolean,
        default: false
    },

    // Status and Progress
    status: {
        type: String,
        enum: ["Scheduled", "In Progress", "Completed", "Cancelled", "Overdue"],
        default: "Scheduled"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },

    // Associations
    associatedLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead"
    },
    associatedOpportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity"
    },

    // Completion Tracking
    completedAt: {
        type: Date
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { 
    timestamps: true 
});

// Index for better query performance
taskSchema.index({ owner: 1, startDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ reminder: 1, reminderSent: 1 });
taskSchema.index({ associatedLead: 1 });
taskSchema.index({ associatedOpportunity: 1 });

// Virtual for full start datetime
taskSchema.virtual('startDateTime').get(function() {
    return new Date(`${this.startDate}T${this.startTime}`);
});

// Virtual for full end datetime
taskSchema.virtual('endDateTime').get(function() {
    return new Date(`${this.endDate}T${this.endTime}`);
});

// Virtual for reminder datetime
taskSchema.virtual('reminderDateTime').get(function() {
    if (!this.reminder) return null;
    const reminderMinutes = parseInt(this.reminderTime);
    const startDateTime = new Date(`${this.startDate}T${this.startTime}`);
    return new Date(startDateTime.getTime() - reminderMinutes * 60000);
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
    const now = new Date();
    const endDateTime = new Date(`${this.endDate}T${this.endTime}`);
    return now > endDateTime && this.status !== 'Completed' && this.status !== 'Cancelled';
};

// Method to mark as completed
taskSchema.methods.markAsCompleted = function(userId) {
    this.status = 'Completed';
    this.completedAt = new Date();
    this.completedBy = userId;
    return this.save();
};

// Static method to get tasks by date range
taskSchema.statics.getTasksByDateRange = function(startDate, endDate, ownerId = null) {
    const query = {
        startDate: { $gte: startDate, $lte: endDate }
    };
    
    if (ownerId) {
        query.owner = ownerId;
    }
    
    return this.find(query)
        .populate('owner', 'username email')
        .populate('organizer', 'username email')
        .populate('associatedLead', 'name email phone')
        .populate('associatedOpportunity', 'name')
        .sort({ startDate: 1, startTime: 1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    return this.find({
        $or: [
            { 
                startDate: { $lt: now.toISOString().split('T')[0] },
                status: { $in: ['Scheduled', 'In Progress'] }
            },
            {
                startDate: now.toISOString().split('T')[0],
                startTime: { $lt: currentTime },
                status: { $in: ['Scheduled', 'In Progress'] }
            }
        ]
    })
    .populate('owner', 'username email')
    .populate('organizer', 'username email');
};

// Static method to get tasks requiring reminders
taskSchema.statics.getTasksForReminder = function() {
    const now = new Date();
    
    return this.find({
        reminder: true,
        reminderSent: false,
        status: { $in: ['Scheduled', 'In Progress'] },
        $expr: {
            $lte: [
                {
                    $dateToString: {
                        format: "%Y-%m-%dT%H:%M:%S",
                        date: "$reminderDateTime"
                    }
                },
                now.toISOString()
            ]
        }
    })
    .populate('owner', 'username email phone')
    .populate('organizer', 'username email');
};

// Pre-save middleware to update status if overdue
taskSchema.pre('save', function(next) {
    if (this.isModified('startDate') || this.isModified('startTime') || this.isModified('endDate') || this.isModified('endTime')) {
        if (this.isOverdue() && this.status === 'Scheduled') {
            this.status = 'Overdue';
        }
    }
    next();
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;