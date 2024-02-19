const products = require("../model/productmodel");
const category = require("../model/categoryModel");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const product = require("../model/productmodel");
const mongoose = require("mongoose");

const loadproduct = async (req, res) => {
  try {
    const Products = await products.find({});

    res.render("admin/product", { Products });
  } catch (error) {
    console.log(error.message);
  }
};

const loadaddproducts = async (req, res) => {
  try {
    const productData = await category.find({ is_Listed: 1 });
    res.render("admin/addproduct", { productData });
  } catch (error) {
    console.log(error.message);
  }
};

const addproduct = async (req, res) => {
  try {
    const productDatas = await products.find({ name: req.body.productname });

    if (productDatas.length > 0) {
      return res.status(404).send("It's already existed");
    }

    const { productName, description, quantity, categories, price } = req.body;
    const filenames = [];
    const existcategory = await category.findOne({ name: categories });
    const Datas = await category.find({ is_listed: 1 });

    if (!req.files || req.files.length !== 4) {
      return res.render("admin/addproduct", {
        message: "you need four photos",
        productData: Datas,
      });
    }
    for (let i = 0; i < req.files.length; i++) {
      const imagepath = path.join(
        __dirname,
        "../public/proImage",
        req.files[i].filename
      );
      await sharp(req.files[i].path)
        .resize(800, 1200, { fit: "fill" })
        .toFile(imagepath);
      filenames.push(req.files[i].filename);
    }
    const newproduct = new products({
      name: productName,
      description,
      quantity,
      price,
      Image: filenames,
      category: existcategory._id,
      date: new Date(),
    });

    await newproduct.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const loadeditproduct = async (req, res) => {
  try {
    const id = req.query.productId;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const productData = await category.find({ is_Listed: 1 });
    const Datas = await products.findOne({ _id: id });

    if (!Datas) {
      return res.status(404).send("Product not found");
    }

    const messages = {};
    res.render("admin/editproduct", { productData, Datas, messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const editproduct = async (req, res) => {
  try {
    const id = req.body.id;
    const { productName, description, quantity, categories, price } = req.body;

    const Datas = await products.findOne({ _id: id });
    const productData = await category.find({ is_Listed: 1 });
    const imageData = [];
    if (req.files) {
      const existedimagecount = (await products.findById(id)).Image.length;
      if (existedimagecount + req.files.length !== 4) {
        return res.render("admin/editproduct", {
          message: "4 Images Only Needed",
          productData,
          Datas,
          
        });
      } else {
        for (let i = 0; i < req.files.length; i++) {
          const resizedpath = path.join(
            __dirname,
            "../public/proImage",
            req.files[i].filename
          );
          await sharp(req.files[i].path)
            .resize(800, 1200, { fit: "fill" })
            .toFile(resizedpath);

          imageData.push(req.files[i].filename);
        }
      }
    }

    const selectcategory = await category.findOne({
      name: categories,
      is_Listed: 1,
    });

    const updateproduct = await products.findOneAndUpdate(
      { _id: id },
      {
        name: productName,
        description,
        quantity: quantity,
        price,
        categories: selectcategory._id,
        $push: { Image: { $each: imageData } },
      },
      {
        new: true,
      }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};

const listproduct = async (req, res) => {
  try {
    const productId = req.body.id;
    await products.updateOne({ _id: productId }, { $set: { is_Listed: true } });
    res.redirect("/admin/product");
  } catch (error) {
    console.error("Error in listproduct:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const unlistedproduct = async (req, res) => {
  try {
    const productId = req.body.id;
    await products.updateOne(
      { _id: productId },
      { $set: { is_Listed: false } }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.error("Error in unlistproduct:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteproduct = async (req, res) => {
  try {
    const id = req.query.id;
    await products.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteimage = async (req, res) => {
  try {
    const { img, prdtid } = req.body;
    if (!prdtid) {
      return res
        .status(400)
        .send({ success: false, error: "Product id is required." });
    }

    const validProductId = mongoose.Types.ObjectId.isValid(prdtid);
    if (!validProductId) {
      return res
        .status(400)
        .send({ success: false, error: "Invalid product id." });
    }

    if (!img) {
      return res
        .status(400)
        .send({ success: false, error: "Image is required." });
    }

    fs.unlink(path.join(__dirname, "/public/proImage", img), () => {});

    await product.updateOne({ _id: prdtid }, { $pull: { Image: img } });

    res.send({ success: true });
    console.log("The image has been deleted.");
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: "Failed to delete image." });
  }
};
module.exports = {
  loadproduct,
  loadaddproducts,
  addproduct,
  loadeditproduct,
  editproduct,
  listproduct,
  unlistedproduct,
  deleteproduct,
  deleteimage,
};
