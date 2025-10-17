import Task from "../models/taskModel.js";

// Create a new task
export const createTask = async (req, res) => {
    try {
        const {
            taskType,
            subject,
            description,
            owner,
            organizer,
            startDate,
            startTime,
            endDate,
            endTime,
            reminder,
            reminderTime,
            associatedLead,
            associatedOpportunity,
            priority
        } = req.body;

        // Validate required fields
        if (!taskType || !subject || !owner || !organizer || !startDate || !startTime || !endDate || !endTime) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: taskType, subject, owner, organizer, startDate, startTime, endDate, endTime'
            });
        }

        // Validate date consistency
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        
        if (endDateTime <= startDateTime) {
            return res.status(400).json({
                status: 'error',
                message: 'End date/time must be after start date/time'
            });
        }

        const task = new Task({
            taskType,
            subject,
            description,
            owner,
            organizer,
            startDate,
            startTime,
            endDate,
            endTime,
            reminder: reminder || false,
            reminderTime: reminderTime || '15',
            associatedLead,
            associatedOpportunity,
            priority: priority || 'Medium',
            createdBy: req.user?._id || organizer
        });

        await task.save();

        // Populate the saved task
        const populatedTask = await Task.findById(task._id)
            .populate('owner', 'username email')
            .populate('organizer', 'username email')
            .populate('associatedLead', 'name email phone')
            .populate('associatedOpportunity', 'name')
            .populate('createdBy', 'username email');

        res.status(201).json({
            status: 'success',
            message: 'Task created successfully',
            data: populatedTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all tasks with filtering and pagination
export const getAllTasks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'startDate',
            sortOrder = 'asc',
            search,
            taskType,
            status,
            priority,
            owner,
            organizer,
            startDate,
            endDate
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (taskType) filter.taskType = taskType;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (owner) filter.owner = owner;
        if (organizer) filter.organizer = organizer;

        // Date range filter
        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) filter.startDate.$gte = startDate;
            if (endDate) filter.startDate.$lte = endDate;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const tasks = await Task.find(filter)
            .populate('owner', 'username email')
            .populate('organizer', 'username email')
            .populate('associatedLead', 'name email phone')
            .populate('associatedOpportunity', 'name')
            .populate('createdBy', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await Task.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Tasks fetched successfully',
            data: tasks,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

// Get task by ID
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id)
            .populate('owner', 'username email')
            .populate('organizer', 'username email')
            .populate('associatedLead', 'name email phone')
            .populate('associatedOpportunity', 'name')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email')
            .populate('completedBy', 'username email');

        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Task fetched successfully',
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid task ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch task',
            error: error.message
        });
    }
};

// Update task
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.createdBy;

        // Add updatedBy field
        updateData.updatedBy = req.user?._id;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        )
        .populate('owner', 'username email')
        .populate('organizer', 'username email')
        .populate('associatedLead', 'name email phone')
        .populate('associatedOpportunity', 'name')
        .populate('updatedBy', 'username email');

        if (!updatedTask) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid task ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to update task',
            error: error.message
        });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully',
            data: {
                id: deletedTask._id,
                subject: deletedTask.subject
            }
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid task ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete task',
            error: error.message
        });
    }
};

// Mark task as completed
export const markTaskAsCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }

        await task.markAsCompleted(userId);

        const updatedTask = await Task.findById(id)
            .populate('owner', 'username email')
            .populate('organizer', 'username email')
            .populate('completedBy', 'username email');

        res.status(200).json({
            status: 'success',
            message: 'Task marked as completed',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error marking task as completed:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid task ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to mark task as completed',
            error: error.message
        });
    }
};

// Get tasks by owner
export const getTasksByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status, priority, startDate, endDate } = req.query;

        const filter = { owner: ownerId };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) filter.startDate.$gte = startDate;
            if (endDate) filter.startDate.$lte = endDate;
        }

        const tasks = await Task.find(filter)
            .populate('owner', 'username email')
            .populate('organizer', 'username email')
            .populate('associatedLead', 'name email phone')
            .populate('associatedOpportunity', 'name')
            .sort({ startDate: 1, startTime: 1 });

        res.status(200).json({
            status: 'success',
            message: 'Tasks fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks by owner:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

// Get overdue tasks
export const getOverdueTasks = async (req, res) => {
    try {
        const tasks = await Task.getOverdueTasks();

        res.status(200).json({
            status: 'success',
            message: 'Overdue tasks fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch overdue tasks',
            error: error.message
        });
    }
};

// Get tasks for reminder
export const getTasksForReminder = async (req, res) => {
    try {
        const tasks = await Task.getTasksForReminder();

        res.status(200).json({
            status: 'success',
            message: 'Tasks for reminder fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks for reminder:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tasks for reminder',
            error: error.message
        });
    }
};