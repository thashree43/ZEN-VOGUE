const mongoose = require("mongoose");

const CategoryModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  offer: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'offer',
},
discountedPrice: Number
,
  is_Listed: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("category", CategoryModel);
