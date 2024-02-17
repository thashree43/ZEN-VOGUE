const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const WishlistSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
      product:[{
        productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
          },
      }]
})

module.exports = mongoose.model("Wishlist",WishlistSchema)