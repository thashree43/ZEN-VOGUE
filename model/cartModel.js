const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const CartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      total: {
        type: Number,
        default: 0,
      },
    },

  ],
  coupondiscount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Coupon",
    default:null
  }
});

module.exports = mongoose.model("Cart", CartSchema);
