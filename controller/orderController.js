const Category = require("../model/categoryModel");
const Product = require("../model/productmodel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");
const dotenv = require("dotenv");
dotenv.config();
const Razorpay = require("razorpay");
const crypto = require("crypto");

var instance = new Razorpay({
  key_id: "rzp_test_gxkxYQEh9554jI",
  key_secret: process.env.Razorpay_Secret_key,
});

// place the order
const placetheorder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { address, subtotal, paymentMethod } = req.body;

    const userAddress = await Address.findOne({
      "address._id": req.body.addressId,
    });

    addressObject = userAddress.address[0];

    const userdata = await User.findOne({ _id: req.session.userId });

    const cartdata = await Cart.findOne({ user: userId }).populate(
      "coupondiscount"
    );

    for (const cartProduct of cartdata.product) {
      const productdata = await Product.findOne({ _id: cartProduct.productId });
      if (cartProduct.quantity > productdata.quantity) {
        res.json({
          success: false,
          message: `Not enough stock available for product: ${productdata.name}`,
        });
        return;
      }
    }

    const exprdate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const products = cartdata.product;
    const status = paymentMethod == "COD" ? "placed" : "pending";
    const totalprice = cartdata.coupondiscount
      ? subtotal - cartdata.coupondiscount.discountamount
      : subtotal;

    const neworder = new Order({
      deliveryDetails: addressObject,
      user: userdata._id,
      username: userdata.name,
      paymentmethod: paymentMethod,
      product: products,
      subtotal: totalprice,
      status: status,
      Date: Date.now(),
      exprdate: exprdate,
    });

    const saveorder = await neworder.save();
    const orderId = saveorder._id;
    const totalamount = saveorder.subtotal;

    if (status == "placed") {
      for (const cartProduct of cartdata.product) {
        await Product.findByIdAndUpdate(
          { _id: cartProduct.productId },
          { $inc: { quantity: -cartProduct.quantity } }
        );
      }

      const deletefromcart = await Cart.findOneAndDelete({ user: userId });
      console.log("product deleted from cart ", deletefromcart);
      return res.json({ success: true, orderId });
    } else {
      const orders = await instance.orders.create({
        amount: totalamount * 100,
        currency: "INR",
        receipt: "" + orderId,
      });

      res.json({ success: false, orders });
    }
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

// ---------------------------------------------------------------------------------------------------------
const verifypayment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const Data = req.body;

    let hmac = crypto.createHmac("sha256", process.env.Razorpay_Secret_key);
    hmac.update(Data.razorpay_order_id + "|" + Data.razorpay_payment_id);
    const hmacvalue = hmac.digest("hex");

    if (hmacvalue == Data.razorpay_signature) {
      for (const Data of Cart.product) {
        const { productId, quantity } = Data;
        await Product.findByIdAndUpdate(
          { _id: productId },
          { $inc: { quantity: -quantity } }
        );
      }
    }

    const neworder = await Order.findByIdAndUpdate(
      { _id: Data.orders.receipt },
      { $set: { status: "placed" } }
    );

    const cartdata = await Cart.findOne({ user: userId }).populate(
      "coupondiscount"
    );

    for (const Data of cartdata.product) {
      await Product.updateOne(
        { _id: Data.productId },
        { $inc: { quantity: -Data.quantity } }
      );
    }

    const orderId = await neworder._id;

    const cartdelete = await Cart.deleteOne({ _id: cartdata._id });
    console.log("the cartdata has been deleted", cartdelete);
    res.json({ orderId, success: true });
  } catch (error) {
    console.log(error.message);
  }
};

// order success page gettinng
const orderplaced = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(" the order id may here for ordersuccess page  ", id);
    const userId = req.session.userId;
    console.log("the user if for order success page may here provide", userId);
    const userdata = await User.findOne({ _id: userId });
    const order = await Order.findOne({ _id: id });
    res.render("user/ordersuccess", { order: order });
  } catch (error) {
    console.log(error.message);
  }
};

// order list
const orderlist = async (req, res) => {
  try {
    const user = req.session.userId;
    const userdata = await User.findOne({ _id: user });

    const orders = await Order.find({ user: user }).sort({ Date: -1 });

    res.render("user/orderlist", { orders, userdata, user });
  } catch (error) {
    console.log(error.message);
  }
};

// cancel the order
const cancelorder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.body.orderId;

    const data = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (data) {
      res.json({ success: true });
    } else {
      res.json({
        success: false,
        message: "Order not found or not owned by the user",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// return the order
const returnorder = async (req, res) => {
  try {
    const userId = req.session.userId;

    const orderId = req.body.orderId;

    const orders = await Order.findById({ _id: orderId });

    if (Date.now() > orders.exprdate) {
      res.json({ datelimit: true });
    } else {
      await Order.findByIdAndUpdate(
        { _id: orderId },
        { $set: { status: "waiting for approval" } }
      );
      res.json({ return: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// order view
const orderview = async (req, res) => {
  try {
    const user = req.session.userId;
    const id = req.query.id;

    const userdata = await User.findOne({ _id: user });

    const orderdata = await Order.findById({ _id: id }).populate(
      "product.productId"
    );
    console.log(orderdata);

    res.render("user/orderview", { orderdata, userdata, user });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  placetheorder,
  verifypayment,
  orderplaced,
  orderlist,
  cancelorder,
  returnorder,
  orderview,
};
