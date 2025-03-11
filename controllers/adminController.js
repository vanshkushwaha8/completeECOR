import User from '../models/User.js'; 
import Order from '../models/Order.js';

// View Users with Pagination
export const viewUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find({ role: 'user' }).skip(skip).limit(limit),
      User.countDocuments({ role: 'user' })
    ]);

    res.json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// View Retailers with Pagination
export const viewRetailers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [retailers, totalRetailers] = await Promise.all([
      User.find({ role: 'retailer' }).skip(skip).limit(limit),
      User.countDocuments({ role: 'retailer' })
    ]);

    res.json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(totalRetailers / limit),
      totalRetailers,
      retailers
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Search Reports with Pagination
export const searchReports = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const userFilter = { role: 'user', $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]};
    
    const retailerFilter = { role: 'retailer', $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]};

    const [users, totalUsers] = await Promise.all([
      User.find(userFilter).skip(skip).limit(limit),
      User.countDocuments(userFilter)
    ]);

    const [retailers, totalRetailers] = await Promise.all([
      User.find(retailerFilter).skip(skip).limit(limit),
      User.countDocuments(retailerFilter)
    ]);

    const [orders, totalOrders] = await Promise.all([
      Order.find().populate('user').populate('items.product').skip(skip).limit(limit),
      Order.countDocuments()
    ]);

    res.json({
      status: true,
      currentPage: page,
      totalUsers,
      totalRetailers,
      totalOrders,
      users,
      retailers,
      orders
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
