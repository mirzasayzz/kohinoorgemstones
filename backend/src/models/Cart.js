import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gemstone',
      required: true
    },
    name: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

cartSchema.methods.calcTotal = function () {
  return this.items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
};

cartSchema.methods.toCartJSON = function () {
  return {
    items: this.items,
    total: this.calcTotal(),
    itemCount: this.items.reduce((total, item) => total + item.quantity, 0)
  };
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;