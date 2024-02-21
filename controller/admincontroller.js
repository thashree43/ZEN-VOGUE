const User = require("../model/userModel");
const Order = require("../model/orderModel");
const bcrypt = require("bcrypt");
const { findByIdAndUpdate } = require("../model/categoryModel");

const adminlogin = async (req, res) => {
  try {
    res.render("admin/adminlogin", {
      messages: { message: "Enter email & password" },
    });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyadminlogin = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email });

    if (userData) {
      const passwordmatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordmatch) {
        req.session.admin_id = userData._id;
        res.redirect("/admin/dashboard");
      } else {
        const messages = { message: "Incorrect password" };
        res.render("admin/adminlogin", { messages: messages });
      }
    } else {
      const messages = { message: "Admin email is incorrect" };
      res.render("admin/adminlogin", { messages: messages });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminlogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const admindashboard = async (req, res) => {
  try {
    res.render("admin/adminhome");
  } catch (error) {
    console.log(error.message);
  }
};

const usermanagement = async (req, res) => {
  try {
    const Users = await User.find();
    res.render("admin/usermanagement", { Users: Users });
  } catch (error) {
    console.log(error.message);
  }
};

const blockuser = async (req, res) => {
  try {
    const userId = req.query.id;
    const actionType = req.query.action;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    const isBlocked = user.is_Blocked === 1;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { is_Blocked: actionType == 1 ? 0 : 1 } },
      { new: true }
    );

    if (updatedUser) {
      res.redirect("/admin/Users");
    } else {
      res.status(500).send("Failed to update user");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// order datas start from here
const orderDetail = async (req, res) => {
  try {
    const orders = await Order.find().sort({ Date: -1 });
    res.render("admin/orderDetail", { orders });
  } catch (error) {
    console.log(error.message);
  }
};

// order status changing from admin side
const orderstatus = async (req, res) => {
  try {
    const id = req.query.id;

    const orders = await Order.findById({ _id: id });

    if (orders.status === "placed") {
      await Order.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "pending" } }
      );
      res.redirect("/admin/orderDetail");
    }
    if (orders.status === "pending") {
      await Order.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "placed" } }
      );
      res.redirect("/admin/orderDetail");
    } else {
      res.redirect("/admin/orderDetail");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// order cancel
const ordercancel = async (req, res) => {
  try {
    const id = req.query.id;

    const orders = await Order.findById({ _id: id });

    if (orders) {
      await Order.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "cancelled" } }
      );
    }
    res.redirect("/admin/orderDetail");
  } catch (error) {
    console.log(error.message);
  }
};

// order deliver status changing
const orderdelivered = async (req, res) => {
  try {
    const id = req.query.id;

    const orders = await Order.findById({ _id: id });

    if (orders.status === "placed") {
      await Order.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "delivered" } }
      );
    }
    if (orders.status === "waiting for approval") {
      await Order.findByIdAndUpdate(
        { _id: id },
        { $set: { status: "Return Approved" } }
      );

      res.redirect("/admin/orderDetail");
    } else {
      res.redirect("/admin/orderDetail");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const salepage = async (req, res) => {
  try {
    const order = await Order.find()
      .populate({
        path: "product.productId",
        select: "name", 
      })
      ;
    res.render("admin/salesreport", { order: order });
  } catch (error) {
    console.log(error.message);
  }
};

const salefilter =async(req,res)=>{
  try {
    const fromdate =req.body.fromdate ? new Date(req.body.fromdate) : null
    fromdate.setHours(0, 0, 0, 0);
    const todate=req.body.todate ? new Date(req.body.todate) :null
    todate.setHours(23, 59, 59, 999);

    const currentdate= new Date ()

    console.log("the from date br like this ",fromdate);
    console.log("the to date be like this ",todate);

    if(fromdate && todate){
    if(todate < fromdate){
      let temp =fromdate
      fromdate = todate
      todate=temp
    }
    }else if(fromdate){
      todate = currentdate
    }else if(todate){
      fromdate = currentdate
    }
    
    const order = await Order.find({Date:{$gte:fromdate,$lte:todate},status:"delivered"})
    .populate({
      path: "product.productId",
      select: "name", 
    });
    console.log("the order based on filter",order);
    res.render("admin/salesreport",{order})
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = {
  adminlogin,
  verifyadminlogin,
  admindashboard,
  usermanagement,
  blockuser,
  adminlogout,
  orderDetail,
  orderstatus,
  orderdelivered,
  ordercancel,
  salepage,
  salefilter,
};
