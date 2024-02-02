import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  date: { type: Date, default: Date.now },
  price: { type: mongoose.Schema.Types.Decimal128, required: true }
});
const Price = mongoose.model('Price', priceSchema);
export default Price;
