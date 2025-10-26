import express from 'express';
import {  handleUploadError, processUploadedFile, uploadNote } from '../middleware/multer.js';
import { addNote, getNoteById, getNotesByLeadId, allNotes, updateNote, deleteNote } from '../controllers/noteController.js';
import { userAuth } from '../middleware/auth.js';
const noteRoutes = express.Router();



noteRoutes.post('/add', userAuth, uploadNote,  handleUploadError, processUploadedFile('notes'), addNote);
noteRoutes.get('/lead/:leadId', userAuth, getNotesByLeadId);  
noteRoutes.get('/all', userAuth, allNotes);
noteRoutes.get('/:id', userAuth, getNoteById);
noteRoutes.put('/:id', userAuth, updateNote);
noteRoutes.delete('/:id', userAuth, deleteNote);

export default noteRoutes;