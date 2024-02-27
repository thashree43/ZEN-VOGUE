const mongoose = require("mongoose");

const CategoryModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offers', // Corrected reference to match the exported model name
  }],
  discountedPrice: Number,
  is_Listed: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Category", CategoryModel);

