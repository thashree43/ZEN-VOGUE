const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ProductsModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offers', 
  }],
  Image: {
    type: [String],
    required: true,
  },
  brand:{
    type:String,
    required:true
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  is_Listed: {
    type: Boolean,
    default: true,
  },
});
const Product = mongoose.model("Product", ProductsModel);
module.exports = Product;
