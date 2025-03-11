import express from'express';
const router = express.Router();
import { authMiddleware } from '../middleware/authMiddleware.js';
import { viewUsers, viewRetailers, searchReports }from'../controllers/adminController.js';

// Only admin has access
router.get('/users', authMiddleware(['admin']), viewUsers);
router.get('/retailers', authMiddleware(['admin']), viewRetailers);
router.get('/reports', authMiddleware(['admin']), searchReports);

export default router;
