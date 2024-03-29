const mongoose = require('mongoose');

const { ObjectId } = require('mongodb');

const productSchema = {
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  store: { type: ObjectId, ref: 'Store', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  addedBy: { type: ObjectId, ref: 'User', required: true },
};


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
