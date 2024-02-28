const User = require("../model/userModel");
const Product = require("../model/productmodel");
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");
const Cart = require("../model/cartModel");
const Wishlist = require("../model/wishlistModel")
const Coupon=require("../model/couponModel");
const { Long } = require("mongodb");


// cart for opening
const cartopen = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      const cartdata = await Cart.findOne({ user: userId }).populate({
        path: "product.productId",
        model: "Product",
        populate: [
          { path: "category", model: "Category", populate: { path: "offers" } },
          { path: "offers" }
        ]
      });
      const subtotal = cartdata?.product.reduce(
        (acc, val) => acc + val.total,
        0
      );
        let total = 0;

      cartdata.product.forEach((product)=>{

        if(product.productId.offers){

          let offer = product.productId.offers[0].discount;
          total += (product.productId.price-((product.productId.price * offer)/100))*product.quantity;

        }else if(product.productId.category.offers){

          let offer = product.productId.category.offers[0].discount;
          total += (product.productId.price-((product.productId.price * offer)/100))*product.quantity;

        }else{

          total += product.productId.price*product.quantity;

        }
      });
      console.log('discountTotal:',total);

      res.render("user/cart", { cartdata, subtotal,total, user: req.session.userId });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addtocart = async (req, res) => {
  try {
    const { userId } = req.session;

    if (!userId) {
      return res.json({ session: false, error: "Please login first" });
    }

    const userdata = await User.findOne({ _id: userId });

    if (!userdata) {
      return res.json({ session: false, error: "User not found" });
    }

    const productid = req.body.productId;
    const productdata = await Product.findById(productid);

    if (!productdata || productdata.quantity === 0) {
      return res.json({
        quantity: false,
        error: "Product not found or out of stock",
      });
    }

    const existingproduct = await Cart.findOne({
      user: userId,
      "product.productId": productid,
    });

    if (existingproduct) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          user: userId,
          "product.productId": productid,
        },
        {
          $inc: { "product.$.quantity": 1 },
        },
        { new: true }
      );
      return res.json({ success: true, stock: true, updatedCart });
    } else {
      const cartdata = await Cart.findOneAndUpdate(
        {
          user: userId,
        },
        {
          $set: { user: userId },
          $push: {
            product: {
              productId: productid,
              price: productdata.price,
              quantity: 1,
              total: productdata.price,
            },
          },
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true, stock: true, cartdata });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};


const updatecart = async (req, res) => {
  try {
    console.log("reached");
    const product_id = req.body.productId;

    const user_id = req.session.userId;

    const count = req.body.count;

    let product = await Product.findOne({ _id: product_id });

    const cartData = await Cart.findOne({ user: user_id });

    if (count == -1) {
      const currentquantity = cartData.product.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentquantity <= 1) {
        return res.json({
          success: false,
          error: "Quantity cannot be decreased further.",
        });
      }
    }
    if (count == 1) {
      const currentquantity = cartData.product.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentquantity + count > product.quantity) {
        return res.json({
          success: false,
          error: "Cannot add more than the quantity",
        });
      }
    }

    const cartDetail = await Cart.findOneAndUpdate(
      {
        user: user_id,
        "product.productId": product_id,
      },
      {
        $inc: {
          "product.$.quantity": count,
          "product.$.total":
            count *
            cartData.product.find((p) => p.productId.equals(product_id)).price,
        },
      }
    );
    console.log(cartDetail, count, "checking cart");
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};


// remove cart
  const removecart = async (req, res) => {
    try {
      const userId = req.session.userId;

      const productId = req.body.productId;

      const result = await Cart.findOneAndUpdate(
        { user: userId },

        { $pull: { product: { productId: productId } } }
      );
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
    }
  };

// checkout page
const loadcheckoutpage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const currentdate = new Date();
currentdate.setUTCHours(0, 0, 0, 0);


const Wallet = await User.findOne({_id:userId})

const coupon = await Coupon.find({
  expiryDate: { $gt: currentdate },
});

    const address1 = await Address.findOne({ user: userId });
    
    
    const cartdata = await Cart.findOne({ user: userId }).populate({
      path: "product.productId",
      model: "Product",
      populate: [
        { path: "category", model: "Category", populate: { path: "offers" } },
        { path: "offers" }
      ],
    });

    const cartC = await Cart.findOne({ user: userId }).populate('coupondiscount');


    const address = address1.address;
    
    let subtotal = 0;

    cartdata.product.forEach((product)=>{

      if(product.productId.offers){

        let offer = product.productId.offers[0].discount;
        subtotal += (product.productId.price-((product.productId.price * offer)/100))*product.quantity;

      }else if(product.productId.category.offers){

        let offer = product.productId.category.offers[0].discount;
        subtotal += (product.productId.price-((product.productId.price * offer)/100))*product.quantity;

      }else{

        subtotal += product.productId.price*product.quantity;

      }
    });


    const couponDiscount = cartC.coupondiscount ? cartC.coupondiscount.discountamount : 0;
    
    const discountAmount = subtotal-couponDiscount
    
  



    res.render("user/checkout", {
      Wallet,
      address,
      cartdata,
      cartC,
      subtotal,
      coupon,
      discountAmount,
      user: req.session.userId,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// delete address from the checkout page
const deleteaddresscheckout = async (req, res) => {
  try {
    const id = req.query.id;
    await Address.updateOne(
      { user: req.session.userId },
      { $pull: { address: { _id: id } } }
    );
    console.log("address deleted");
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const checkoutaddaddress=async(req,res)=>{
  try {
    const userData = await User.findOne({ _id: req.session.userId });
    const { fname, sname, mobile, email, address, city, pin } = req.body;
    const user = req.session.userId;

    if (userData) {
      const Data = await Address.findOneAndUpdate(
        { user: user },
        {
          $push: {
            address: {
              fname: fname,
              sname: sname,
              mobile: mobile,
              email: email,
              address: address,
              city: city,
              pin: pin,
            },
          },
        },
        { new: true, upsert: true }
      );
      res.json({success:true})
    } else {
      res.render("user/addaddress", { loadlogin });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const checkeditaddress = async (req, res,addressId) => {
  try {
    const { index, fname, sname, mobile, email, address, city, pin } = req.body;
    const id=req.body.id
   

    const editaddress=await Address.findOneAndUpdate({
      user:req.session.userId,'address._id':id
    },
    {$set:{
      "address.$.fname": req.body.fname,
      "address.$.sname": req.body.sname,
      "address.$.mobile": req.body.mobile,
      "address.$.email": req.body.email,
      "address.$.address": req.body.address,
      "address.$.city": req.body.city,
      "address.$.pin": req.body.pin,
    },},
    { upsert: true })


    res.json({success:true})
  
  } catch (error) {
    console.log(error.message);
  }
};


// wishlist part-----------------------------

const getwishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishlist = await Wishlist.findOne({ user: userId }).populate('product.productId');
    res.render("user/wishlist", { wishlist: wishlist,user: req.session.userId });
  } catch (error) {
    console.log(error.message);
  }
};


const postwishlist = async (req, res) => {
  try {
    if (req.session.userId) {
      const Id = req.body.Id;
      console.log("this be the id from the wishlist", Id);
      const userId = req.session.userId;

      // Check if the product already exists in the wishlist
      const wishlistProduct = await Wishlist.findOne({ user: userId, "product.productId": Id });

      if (wishlistProduct) {
        // Product already exists in the wishlist, send response to inform the client
        res.json({ check: true });
      } else {
        // Product doesn't exist in the wishlist, add it
        const data = {
          productId: Id
        };

        const loadWishlist = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $addToSet: { product: data } },
          { upsert: true, new: true }
        );

        res.json({ success: true, productId: Id });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const removewishlist =async (req,res)=>{
  try {
    const {proid,ID}= req.body
    console.log("the id for removing the produuct from wishlist",req.body);
    
    const wishlist = await Wishlist.findOneAndUpdate({user:ID},{$pull:{'product':{'productId':proid}}},{new:true})
    console.log("the wishlist whole data may here",wishlist)

    if(wishlist){
      res.json({success:true})
    }

  } catch (error) {
    console.log(error.message);
  }
}
module.exports = {
  cartopen,
  addtocart,
  updatecart,
  removecart,
  loadcheckoutpage,
  deleteaddresscheckout,
  checkoutaddaddress,
  checkeditaddress,
  getwishlist,
  postwishlist,
  removewishlist,
};
