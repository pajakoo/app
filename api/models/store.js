import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: String,
  addedBy: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
 