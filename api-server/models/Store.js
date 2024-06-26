const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
