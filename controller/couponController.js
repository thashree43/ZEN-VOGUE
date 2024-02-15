const Cart = require("../model/cartModel");
const Coupon = require("../model/couponModel");

// loadcoupon
const loadcoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find({});

    res.render("admin/coupon", { coupon });
  } catch (error) {
    console.log(error.message);
  }
};

// loadaddcoupon
const loadaddcoupon = async (req, res) => {
  try {
    res.render("admin/addcoupon");
  } catch (error) {
    console.log(error.message);
  }
};
// addcoupon start
const addcoupon = async (req, res) => {
  try {
    const coupondata = await Coupon.findOne({
      couponcode: req.body.couponcode,
    });
    if (coupondata) {
      return res.render("addcoupon", { message: "Coupon code already exists" });
    } else {
      const data = new Coupon({
        name: req.body.name,
        couponcode: req.body.couponcode,
        discountamount: req.body.discountamount,
        activateDate: req.body.activateDate,
        expiryDate: req.body.expiryDate,
        criteriaamount: req.body.criteriaamount,
      });

      await data.save();
      return res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

// admin side delete coupon

const deletecoupon = async (req, res) => {
  try {
    const cpnId = req.body.cpnId;
    const coupon = await Coupon.deleteOne({ _id: cpnId });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).send("Internal Server Error");
  }
};

// apply coupon
const applycoupon = async (req, res) => {
  try {
    const couponId = req.body.id;

    const userId = req.session.userId;

    const currentdate = new Date();

    const coupondata = await Coupon.findOne({
      _id: couponId,
      expiryDate: { $gt: currentdate },
    });

    const Exist = coupondata.useduser.includes(userId);

    if (!Exist) {
      const existingcart = await Cart.findOne({ user: userId });

      if (existingcart && existingcart.coupondiscount == null) {
        const adduser = await Coupon.findByIdAndUpdate(
          { _id: couponId },
          { $push: { useduser: userId } }
        );

        const addcart = await Cart.findOneAndUpdate(
          { user: userId },
          { $set: { coupondiscount: coupondata._id } }
        );

        res.json({ coupon: true ,coupondata });
      } else {
        res.json({ coupon: "Already Applied" });
      }
    } else {
      res.json({ coupon: "AlreadyUsed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const removecoupon = async (req, res) => {
  try {
    const couponId = req.body.id;

    const userId=req.session.userId

    const cartdata= await Cart.findOne({user:userId})

    const coupondata= await Coupon.findByIdAndUpdate({_id:couponId},{$pull:{useduser:userId}})

    const cartupdate=await Cart.findOneAndUpdate({user:userId},{$set:{coupondiscount:null}})

    res.json({ success:true})

  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadcoupon,
  loadaddcoupon,
  addcoupon,
  deletecoupon,
  applycoupon,
  removecoupon,
};
