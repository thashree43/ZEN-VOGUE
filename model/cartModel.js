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
      name:{
        type:String,
        required:true
      },
      price: {
        type: Number,
        default: 0,
      },
      brand:{
        type:String,
        required:true
      },
      quantity: {
        type: Number,
        default: 1,
      },
      category:{
        type:String,
        required:true
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
  },
   shippingCharge: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
