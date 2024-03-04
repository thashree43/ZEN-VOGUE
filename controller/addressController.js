const User = require("../model/userModel");
const Product = require("../model/productmodel");
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");

// address in myaccount-------
const addaddress = async (req, res) => {
  try {
    const loadlogin = req.session.userId;
    const userid = await User.findOne({ _id: req.session.userId });
    res.render("user/addaddress", { loadlogin,user:req.session.userId });
  } catch (error) {
    console.log(error.message);
  }
};

const postaddaddress = async (req, res) => {
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
      res.redirect("/myaccount");
    } else {
      res.render("user/addaddress", { loadlogin });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editaddress = async (req, res) => {
  try {
    const loadlogin = req.session.userId;
    const addressid = req.query.id;

    const userid = await User.findOne({ _id: req.session.userId });
    const usersid = req.session.userId;
    const index = req.query.index;
    const editdata = await Address.findOne({ user: usersid });
    const value = editdata.address[index];
    res.render("user/editaddress", {
      loadlogin,
      user: userid.name,
      value,
      index,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updateaddress = async (req, res) => {
  try {
    const { index, fname, sname, mobile, email, address, city, pin } = req.body;
    if (
      fname.trim().length == 0 ||
      sname.trim().length == 0 ||
      mobile.trim().length == 0 ||
      email.trim().length == 0 ||
      address.trim().length == 0 ||
      city.trim().length == 0 ||
      pin.trim().length == 0
    ) {
      res.redirect("/myaccount");
    } else {
      const Id = req.session.userId;

      const updatedaddress = await Address.updateOne(
        { user: req.session.userId, "address.fname": req.body.fname },
        {
          $set: {
            "address.$.fname": req.body.fname,
            "address.$.sname": req.body.sname,
            "address.$.mobile": req.body.mobile,
            "address.$.email": req.body.email,
            "address.$.address": req.body.address,
            "address.$.city": req.body.city,
            "address.$.pin": req.body.pin,
          },
        },
        { upsert: true }
      );

      res.redirect("/myaccount");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteaddress = async (req, res) => {
  try {
    const Id = req.query.id;
    console.log(req.query, Id);
    const Deletedaddress = await Address.updateOne(
      {
        user: req.session.userId,
      },
      { $pull: { address: { _id: Id } } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addaddress,
  postaddaddress,
  editaddress,
  updateaddress,
  deleteaddress,
};
