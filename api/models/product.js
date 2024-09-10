import mongoose from 'mongoose';

const productSchema = {
  barcode: { type: String, required: true, unique: true },
  addedBy: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }
};

const Product = mongoose.model('Product', productSchema);

export default Product;
