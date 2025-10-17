import express from 'express';
import { allUsers, addUser, getUserById, updateUser, deleteUser, loginUser, getProfile } from '../controllers/userController.js';
import { userAuth } from '../middleware/auth.js';
import { uploadUserImage, handleUploadError, processUploadedFile } from '../middleware/multer.js';
const userRoutes = express.Router();

userRoutes.post('/auth', userAuth, getProfile);
userRoutes.get('/all', allUsers);
userRoutes.post('/add', uploadUserImage,  handleUploadError, processUploadedFile('user'), addUser);
userRoutes.get('/get/:id', getUserById);
userRoutes.put('/update/:id', uploadUserImage,  handleUploadError, processUploadedFile('user'), updateUser);
userRoutes.delete('/delete/:id', deleteUser);
userRoutes.post('/login', loginUser);

export default userRoutes;