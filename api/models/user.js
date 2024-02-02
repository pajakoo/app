import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: { type: String  },
  email: { type: String, unique: true },
  photoUrl: { type: String },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }], // Reference to Role model
  addedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('Users', userSchema);

export default User;

