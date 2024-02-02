import mongoose from 'mongoose';

const productSchema = {
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  store: { type:  mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  addedBy: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
};


const Product = mongoose.model('Product', productSchema);

export default Product;
