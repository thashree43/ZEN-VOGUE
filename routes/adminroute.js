// import reqiure modules------
const adminController = require("../controller/admincontroller");
const categoryController = require("../controller/categorycontroller");
const productController = require("../controller/productcontroller");
const couponController = require("../controller/couponController")
const upload = require("../midlewares/upload");
const express = require("express");

const adminRoute = express();
const adminauth = require("../midlewares/adminauth");
// Parse JSON and URL-encoded data---
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));


// routes--------------------------
adminRoute.get("/", adminauth.isLogout, adminController.adminlogin);
adminRoute.post("/", adminauth.isLogout, adminController.verifyadminlogin);
adminRoute.get("/dashboard", adminauth.isLogin, adminController.admindashboard);
adminRoute.get("/adminlogout", adminController.adminlogout);
adminRoute.get("/Users", adminauth.isLogin, adminController.usermanagement);
adminRoute.get("/Block", adminController.blockuser);


// category section
adminRoute.get("/category", adminauth.isLogin, categoryController.loadcategory);
adminRoute.get(
  "/addcategory",
  adminauth.isLogin,
  categoryController.addcategory
);
adminRoute.post(
  "/addcategory",
  adminauth.isLogin,
  categoryController.newcategory
);
adminRoute.post("/edit", adminauth.isLogin, categoryController.editedcategory);
adminRoute.get("/edit", adminauth.isLogin, categoryController.editcategory);
adminRoute.get("/delete", categoryController.deletecategory);
adminRoute.get("/List", categoryController.Listed);
adminRoute.get("/UnList", categoryController.Unlisted);


// product section
adminRoute.get("/product", adminauth.isLogin, productController.loadproduct);
adminRoute.get(
  "/addproduct",
  adminauth.isLogin,
  productController.loadaddproducts
);
adminRoute.get(
  "/editproduct",
  adminauth.isLogin,
  productController.loadeditproduct
);
adminRoute.get("/");
adminRoute.get("/deleteproduct", productController.deleteproduct);
adminRoute.post(
  "/addproduct",
  adminauth.isLogin,
  upload.upload.array("image", 4),
  productController.addproduct
);
adminRoute.post(
  "/editproduct",
  adminauth.isLogin,
  upload.upload.array("image", 4),
  productController.editproduct
);
adminRoute.post("/Listproduct", productController.listproduct);
adminRoute.post("/Unlistproduct", productController.unlistedproduct);
adminRoute.delete("/deleteimage", productController.deleteimage);



// order
adminRoute.get("/orderDetail", adminauth.isLogin, adminController.orderDetail);
adminRoute.get("/orderStatus", adminauth.isLogin, adminController.orderstatus);
adminRoute.get("/orderCancel", adminController.ordercancel);
adminRoute.get(
  "/orderDeliverd",
  adminauth.isLogin,
  adminController.orderdelivered
);

// coupon
adminRoute.get('/coupon',couponController.loadcoupon)
adminRoute.get('/addcoupon',couponController.loadaddcoupon)
adminRoute.post('/addcoupon',couponController.addcoupon)
adminRoute.delete('/deletecoupon',couponController.deletecoupon)

module.exports = adminRoute;
