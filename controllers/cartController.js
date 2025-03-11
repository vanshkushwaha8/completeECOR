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