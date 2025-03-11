import Product from '../models/Product.js';
import Order from '../models/Order.js';
import validateProduct from '../validation/validateProduct.js';

// Retailer: Create a new product
export const createProduct = async (req, res) => {
  console.log("Received request:", req.body);
  const { error } = validateProduct(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  if (!req.user?.id) {
    return res.status(400).json({ status: false, message: 'Retailer ID is missing. Please authenticate properly.' });
  }

  const { name, price, stock } = req.body;
  try {
    const newProduct = new Product({
      name,
      price,
      stock,
      retailer: req.user.id,
      status: 'available'
    });

    await newProduct.save();
    console.log("Product created successfully:", newProduct);

    res.status(201).json({ status: true, message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error("Error in createProduct:", error.message);
    res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

// Retailer: Update a product
export const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, price, stock } = req.body;

  try {
    const product = await Product.findOne({ _id: productId, retailer: req.user.id });
    if (!product) return res.status(404).json({ status: false, message: 'Product not found or you do not have permission to update it.' });

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;

    await product.save();
    res.json({ status: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error("Error in updateProduct:", error.message);
    res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

// Retailer: Delete a product
export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOneAndDelete({ _id: productId, retailer: req.user.id });
    if (!product) return res.status(404).json({ status: false, message: 'Product not found or you do not have permission to delete it.' });

    res.json({ status: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Error in deleteProduct:", error.message);
    res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

// Retailer: Mark product as sold
export const sellProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({ _id: productId, retailer: req.user.id });
    if (!product) return res.status(404).json({ status: false, message: 'Product not found or you do not have permission to mark it as sold.' });

    if (product.stock <= 0) {
      product.status = 'sold';
      await product.save();
      return res.json({ status: true, message: 'Product marked as sold', product });
    } else {
      return res.status(400).json({ status: false, message: 'Product still in stock; cannot mark as sold' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Retailer: View users who purchased
export const viewBuyers = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product').populate('user');
    const filteredOrders = orders.filter(order =>
      order.items.some(item => item.product?.retailer?.toString() === req.user.id)
    );
    const buyersMap = {};
    filteredOrders.forEach(order => {
      buyersMap[order.user._id] = order.user;
    });
    res.json({ buyers: Object.values(buyersMap) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find({ status: 'available' })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ status: 'available' })
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: true,
      currentPage: page,
      totalPages,
      totalProducts,
      products
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

