// routes/taskRoutes.js
import express from 'express';
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    markTaskAsCompleted,
    getTasksByOwner,
    getOverdueTasks,
    getTasksForReminder
} from '../controllers/taskController.js';

const tastRoutes = express.Router();

tastRoutes.post('/add', createTask);
tastRoutes.get('/all', getAllTasks);
tastRoutes.get('/overdue', getOverdueTasks);
tastRoutes.get('/reminders', getTasksForReminder);
tastRoutes.get('/owner/:ownerId', getTasksByOwner);
tastRoutes.get('/:id', getTaskById);
tastRoutes.put('/:id', updateTask);
tastRoutes.put('/:id/complete', markTaskAsCompleted);
tastRoutes.delete('/:id', deleteTask);

export default tastRoutes;