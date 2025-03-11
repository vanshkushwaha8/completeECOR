import express from 'express';
import { authMiddleware,authorize } from '../middleware/authMiddleware.js';
import { createProduct, sellProduct, viewBuyers, getAllProducts } from '../controllers/productController.js';
import { checkout, getAllOrders, getUserOrders } from '../controllers/orderController.js';
import { registerUser, loginUser, getAllUsers, getUserProfile } from '../controllers/userController.js';

const router = express.Router();


// 🚀 **User Authentication Routes**
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.get('/users/profile', authMiddleware,authorize,(['user', 'retailer', 'admin']), getUserProfile);
router.get('/users', authMiddleware(['admin']), getAllUsers); // Admin can get all users

// 🛒 **Product Routes**
router.post('/products', authMiddleware(['retailer']), createProduct);
router.put('/products/sell/:productId', authMiddleware(['retailer']), sellProduct);
router.get('/products/buyers', authMiddleware(['retailer']), viewBuyers);
router.get('/products', authMiddleware(['user', 'retailer', 'admin']), getAllProducts);

// 🛍️ **Order Routes**
router.post('/checkout', authMiddleware(['user']), checkout);
router.get('/orders', authMiddleware(['admin']), getAllOrders); // Admin can see all orders
router.get('/orders/user', authMiddleware(['user', 'retailer']), getUserOrders); // Users/Retailers see their own orders

export default router;
