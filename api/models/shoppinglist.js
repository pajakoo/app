import mongoose from 'mongoose';

const shoppinglistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }, // Reference to Product model
      quantity: { type: Number, default: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ShoppingList = mongoose.model('ShoppingList', shoppinglistSchema);

export default ShoppingList;
