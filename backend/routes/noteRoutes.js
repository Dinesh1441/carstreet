import express from 'express';
import {  handleUploadError, processUploadedFile, uploadNote } from '../middleware/multer.js';
import { addNote, getNoteById, getNotesByLeadId, allNotes, updateNote, deleteNote } from '../controllers/noteController.js';
const noteRoutes = express.Router();



noteRoutes.post('/add', uploadNote,  handleUploadError, processUploadedFile('notes'), addNote);
noteRoutes.get('/lead/:leadId', getNotesByLeadId);  
noteRoutes.get('/all', allNotes);
noteRoutes.get('/:id', getNoteById);
noteRoutes.put('/:id', updateNote);
noteRoutes.delete('/:id', deleteNote);

export default noteRoutes;