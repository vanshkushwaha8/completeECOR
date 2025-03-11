import express from 'express';
import { registerUser, loginUser,logoutController } from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',authMiddleware,logoutController)

export default router; 
