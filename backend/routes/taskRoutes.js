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
import { userAuth } from '../middleware/auth.js';

const tastRoutes = express.Router();

tastRoutes.post('/add', userAuth, createTask);
tastRoutes.get('/all', userAuth, getAllTasks);
tastRoutes.get('/overdue', userAuth, getOverdueTasks);
tastRoutes.get('/reminders', userAuth, getTasksForReminder);
tastRoutes.get('/owner/:ownerId', userAuth, getTasksByOwner);
tastRoutes.get('/:id', userAuth, getTaskById);
tastRoutes.put('/:id', userAuth, updateTask);
tastRoutes.put('/:id/complete', userAuth, markTaskAsCompleted);
tastRoutes.delete('/:id', userAuth, deleteTask);

export default tastRoutes;