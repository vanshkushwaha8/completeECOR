import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectionDB from './config/db.js';

dotenv.config(); 
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


const app = express();
connectionDB(); 

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// aLL routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes); 
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.cyan.bold));
