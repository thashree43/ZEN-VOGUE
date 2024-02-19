const mongoose = require("mongoose");

const OrderModel = new mongoose.Schema({
  deliveryDetails: {
    type: Object,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  paymentmethod: {
    type: String,
  },
  product: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  // totalamount:{
  //     type:Number
  // },
  subtotal: {
    type: Number,
  },
  Date: {
    type: Date,
  },
  exprdate: {
    type: Date,
  },
  status: {
    type: String,
  },
  paymentId: {
    type: String,
  },
});

module.exports = mongoose.model("order", OrderModel);
