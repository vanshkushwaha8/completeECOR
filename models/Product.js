import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  stock:     { type: Number, required: true },
  // Only a retailer can create a product; we store their user ID
  retailer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, enum: ['available', 'sold'], default: 'available' },
});

export default mongoose.model('Product', productSchema);
