import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkout, getAllOrders, getUserOrders } from '../controllers/orderController.js';
const router = express.Router();

router.post('/checkout', authMiddleware(['user']), checkout);
router.get('/orders', authMiddleware(['admin']), getAllOrders);
router.get('/orders/user', authMiddleware(['user', 'retailer']), getUserOrders);

export default router;
