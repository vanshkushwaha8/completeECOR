import mongoose from 'mongoose';


const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      status: {type:String, enum: ['pending', 'processing'], default: 'pending' },
    }
  ]
});

export default mongoose.model('Cart', cartSchema);
