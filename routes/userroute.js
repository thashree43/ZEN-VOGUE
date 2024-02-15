// // import reqiure modules------
// const express = require("express");
// const userRoute = express();
// const userController = require("../controller/usercontroller");
// const addressController = require("../controller/addressController");
// const cartController = require("../controller/cartController");
// const orderController = require("../controller/orderController");
// const userAuth = require("../midlewares/userauth");


// // Parse JSON and URL-encoded data---
// userRoute.use(express.json());
// userRoute.use(express.urlencoded({ extended: true }));

// // routes.......................
// userRoute.get("/", userAuth.isLogout, userController.userHome);
// userRoute.get("/signup", userAuth.isLogout, userController.userRegister);
// userRoute.post("/signup", userController.verifyRegister);

// // otp
// userRoute.get("/user/verifyotp", userAuth.isLogout, userController.loadotp);
// userRoute.get("/sentOtp", userController.getSentOtp);
// userRoute.post("/verifyotp", userController.verifyotp);

// userRoute.get("/login", userAuth.isLogout, userController.userlogin);
// userRoute.post("/login", userController.verifylogin);
// userRoute.get("/home", userAuth.isLogin, userController.AfterLogin);
// userRoute.get("/logout", userAuth.isLogout, userController.userlogout);
// userRoute.get("/shop", userController.loadshop);
// userRoute.get("/productdetail", userController.productdetail);

// // forget password
// userRoute.get("/forget", userAuth.isLogout, userController.loadforgetpassword);
// userRoute.post("/forget", userController.forgetpasswordverify);
// userRoute.get(
//   "/forgetpassword",
//   userAuth.isLogout,
//   userController.forgetpasswordload
// );
// userRoute.post("/forgetpassword", userController.resetpassword);

// // my account
// userRoute.get("/myaccount", userAuth.isLogin, userController.myaccount);
// userRoute.post("/myaccount", userController.profilesubmit);
// userRoute.get("/addaddress", userAuth.isLogin, addressController.addaddress);
// userRoute.post("/addaddress", addressController.postaddaddress);
// userRoute.get("/editaddress", userAuth.isLogin, addressController.editaddress);
// userRoute.post("/editaddress", addressController.updateaddress);
// userRoute.delete("/deleteaddress", addressController.deleteaddress);

// // cart
// userRoute.get("/cart", cartController.cartopen);
// userRoute.post("/cart", cartController.addtocart);
// userRoute.post("/updatecart", cartController.updatecart);
// userRoute.post("/removecart", cartController.removecart);

// // checkout
// userRoute.get("/checkout", userAuth.isLogin, cartController.loadcheckoutpage);
// userRoute.get("/addAddresscheck", addressController.addaddress);
// userRoute.post("/addAddresscheck", addressController.postaddaddress);
// userRoute.get("/editAddresscheck", addressController.editaddress);
// userRoute.post("/editAddresscheck", addressController.updateaddress);
// userRoute.get("/deleteAddressCheck", cartController.deleteaddresscheckout);

// // order
// userRoute.post("/checkout", orderController.placetheorder);
// userRoute.get("/ordersuccess", userAuth.isLogin, orderController.orderplaced);
// userRoute.get("/orderlist", userAuth.isLogin, orderController.orderlist);
// userRoute.post("/cancelorder", userAuth.isLogin, orderController.cancelorder);
// userRoute.post("/returnOrder", userAuth.isLogin, orderController.returnorder);
// userRoute.get("/orderview", orderController.orderview);
// // exporting
// module.exports = userRoute;

const bodyParser = require('body-parser');                           
const express = require("express");
const userRoute = express();
const userController = require("../controller/usercontroller");
const addressController = require("../controller/addressController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const userAuth = require("../midlewares/userauth");
const couponController= require("../controller/couponController")

// Parse JSON and URL-encoded data---
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));


userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));


// routes.......................
userRoute.get("/", userAuth.isLogout, userController.userHome);
userRoute.get("/signup", userAuth.isLogout, userController.userRegister);
userRoute.post("/signup", userController.verifyRegister);

// otp
userRoute.get("/user/verifyotp", userAuth.isLogout, userController.loadotp);
userRoute.get("/sentOtp", userController.getSentOtp);
userRoute.post("/verifyotp", userController.verifyotp);

userRoute.get("/login", userAuth.isLogout, userController.userlogin);
userRoute.post("/login", userController.verifylogin);


userRoute.get("/home", userAuth.isLogin, userController.AfterLogin);
userRoute.get("/logout", userAuth.isLogout, userController.userlogout);
userRoute.get("/shop", userAuth.isLogin, userController.loadshop);
userRoute.get("/productdetail", userAuth.isLogin, userController.productdetail);

// forget password
userRoute.get("/forget", userAuth.isLogout, userController.loadforgetpassword);
userRoute.post("/forget", userController.forgetpasswordverify);
userRoute.get(
  "/forgetpassword",
  userAuth.isLogout,
  userController.forgetpasswordload
);
userRoute.post("/forgetpassword", userController.resetpassword);

// my account
userRoute.get("/myaccount", userAuth.isLogin, userController.myaccount);
userRoute.post("/myaccount", userController.profilesubmit);
userRoute.get("/addaddress", userAuth.isLogin, addressController.addaddress);
userRoute.post("/addaddress", addressController.postaddaddress);
userRoute.get("/editaddress", userAuth.isLogin, addressController.editaddress);
userRoute.post("/editaddress", addressController.updateaddress);
userRoute.delete("/deleteaddress", addressController.deleteaddress);

// cart
userRoute.get("/cart", userAuth.isLogin, cartController.cartopen);
userRoute.post("/cart", userAuth.isLogin, cartController.addtocart);
userRoute.post("/updatecart", userAuth.isLogin, cartController.updatecart);
userRoute.post("/removecart", userAuth.isLogin, cartController.removecart);

// checkout
userRoute.get("/checkout", userAuth.isLogin, cartController.loadcheckoutpage);
userRoute.post("/addAddresscheck",userAuth.isLogin, cartController.checkoutaddaddress);  
userRoute.post("/editAddresscheck",userAuth.isLogin, cartController.checkeditaddress);
userRoute.get("/deleteAddressCheck", cartController.deleteaddresscheckout);

// order
userRoute.post("/checkout", orderController.placetheorder);
userRoute.post('/verifypayment',orderController.verifypayment)
userRoute.get("/ordersuccess", userAuth.isLogin, orderController.orderplaced);
userRoute.get("/orderlist", userAuth.isLogin, orderController.orderlist);
userRoute.post("/cancelorder", userAuth.isLogin, orderController.cancelorder);
userRoute.post("/returnOrder", userAuth.isLogin, orderController.returnorder);
userRoute.get("/orderview", orderController.orderview);

// coupon
userRoute.post("/applycoupon",couponController.applycoupon)
userRoute.post('/removecoupon',couponController.removecoupon)

// exporting
module.exports = userRoute;