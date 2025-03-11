import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
    }
  ],
  totalPrice: { type: Number, required: true },
  createdAt:  { type: Date, default: Date.now },
  status:     { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

export default mongoose.model('Order', orderSchema);
