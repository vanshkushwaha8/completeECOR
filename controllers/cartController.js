import Cart from'../models/Cart.js';
// import validateCart from '../validation/validateCart.js';
//the add to cart item not update of delete
export const addToCart = async (req, res) => {
    // const { error } = validateCart(req.body);
    // if (error) {
    //   return res.status(400).json({ success: false, message: error.details[0].message });
    // }
  const { productId, quantity } = req.body;
  try {
      if (quantity <= 0) {
          return res.status(400).json({ message: 'Quantity must be a positive number' });
      }
      
      let cart = await Cart.findOne({ user: req.user.id });
      console.log('Cart:', cart);
      
      if (!cart) {
          cart = new Cart({ user: req.user.id, items: [] });
      }
      
      // If product already in cart, update quantity; otherwise add new item
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      
      if (itemIndex > -1) {
          console.log('Updating quantity for existing item');
          cart.items[itemIndex].quantity +=+ quantity;
          console.log('Updated quantity:', cart.items[itemIndex].quantity);
      } else {
          cart.items.push({ product: productId, quantity });
      }
      
      await cart.save().then(() => {
          console.log('Cart saved successfully');
      }).catch(error => {
          console.error('Error saving cart:', error);
      });
      
      res.json({ message: 'Item added to cart', cart });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

//remove 
export const removeItemFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
          return res.status(400).json({ message: 'Cart not found' });
      }
      
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
          cart.items.splice(itemIndex, 1);
      } else {
          return res.status(400).json({ message: 'Item not found in cart' });
      }
      
      await cart.save().then(() => {
          console.log('Item removed from cart');
      }).catch(error => {
          console.error('Error removing item from cart:', error);
      });
      
      res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

// view the cart 
export const viewCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Your cart is empty' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// view the cart with pagination
export const viewCart = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default page is 1 and limit is 10 items per page
  
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product')
      .lean(); // Fetch the cart and populate product details

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Your cart is empty' });
    }

    // Implementing pagination
    const totalItems = cart.items.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + Number(limit), totalItems);

    // Slicing items for pagination
    const paginatedItems = cart.items.slice(startIndex, endIndex);

    // Responding with paginated cart details
    res.status(200).json({
      currentPage: Number(page),
      totalPages,
      totalItems,
      itemsPerPage: Number(limit),
      items: paginatedItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// view 2
export const viewCart = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').lean();
    if (!cart || !cart.items.length) return res.status(404).json({ message: 'Your cart is empty' });

    const totalItems = cart.items.length;
    const paginatedItems = cart.items.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      items: paginatedItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
