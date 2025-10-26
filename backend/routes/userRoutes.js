import express from 'express';
import { allUsers, addUser, getUserById, updateUser, deleteUser, loginUser, getProfile } from '../controllers/userController.js';
import { userAuth } from '../middleware/auth.js';
import { uploadUserImage, handleUploadError, processUploadedFile } from '../middleware/multer.js';
const userRoutes = express.Router();

userRoutes.post('/auth', userAuth, getProfile);
userRoutes.get('/all', userAuth, allUsers);
userRoutes.post('/add', userAuth, uploadUserImage,  handleUploadError, processUploadedFile('user'), addUser);
userRoutes.get('/get/:id', userAuth, getUserById);
userRoutes.put('/update/:id', userAuth, uploadUserImage,  handleUploadError, processUploadedFile('user'), updateUser);
userRoutes.delete('/delete/:id', userAuth, deleteUser); 
userRoutes.post('/login', loginUser);

export default userRoutes;