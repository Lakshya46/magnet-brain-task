const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true
  },

  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  stripeSessionId: {
    type: String,
    index: true
  },

  

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
