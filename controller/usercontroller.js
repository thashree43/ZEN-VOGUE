const User = require("../model/userModel");
const Product = require("../model/productmodel");
const Category = require("../model/categoryModel");
const Address=require('../model/addressModel')
const Order=require('../model/orderModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstrings = require("randomstring")
const UserOtpVerification = require("../model/userotpverification");
const userotpverification = require("../model/userotpverification");
const { transporter, sendOtpVerificationMail } = require("../utils/sentOtp");
const fs = require('fs')
const path = require('path')
const ejs = require("ejs");
const puppeteer = require("puppeteer")


const { name } = require("ejs");
require("dotenv").config();

// ------home-----
const userHome = async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findOne({ _id: userId });
    res.render("user/home", { user });
  } catch (error) {
    console.log(error.message);
  }
};

// -------register page---------
const userRegister = async (req, res) => {
  try {
    res.render("user/Register");
  } catch (error) {
    console.log(error.message);
  }
};

const securepassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



function generateReferralCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let referralCode = '';
  for (let i = 0; i < length; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return referralCode;
}

 
const verifyRegister = async (req, res) => {
  try {
    const { email, mobileNumber, password, confirmPassword, referralCode } = req.body;

    const existUser = await User.findOne({ email });

    if (existUser) {
      if (existUser.is_Verified) {
        return res.render("user/Register", { message: "Email already registered" });
      } else {
        return res.render("user/Register", { message: "Email already registered but not verified. So send OTP to email and verify the email" });
      }
    }

    if (password !== confirmPassword) {
      return res.render("user/Register", { message: "Passwords do not match" });
    }

    let referredBy = null;

    if (referralCode) {
      referredBy = await User.findOne({ referralCode });

      if (!referredBy) {
        return res.render("user/Register", { message: "Invalid referral code" });
      }
    }

    const referralCodeForNewUser = generateReferralCode();
    const spassword = await securepassword(password);

    const user = new User({
      name: req.body.name,
      email,
      mobile: mobileNumber,
      password: spassword,
      confirmPassword,
      is_Admin: 0,
      referralCode: referralCodeForNewUser,
      referredBy: referredBy ? referredBy._id : null,
    });

    const userData = await user.save();
    req.session.email = email;
    await sendOtpVerificationMail(userData, res);

    if (referredBy) {
      referredBy.wallet += 100;
      await referredBy.save();

      user.wallet += 50;
      await user.save();
    }

  } catch (error) {
    console.error("Error in verifyRegister:", error.message);
    res.render("user/Register", { message: "An error occurred" });
  }
};


// impoting from utilis
const getSentOtp = async (req, res) => {
  try {
    if (req.session.email) {
      await sendOtpVerificationMail({ email: req.session.email }, res);
    } else {
      res.status(400).send("Email not found in session");
    }
  } catch (error) {
    console.error("Error in getSentOtp:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// Load otp-------------------
const loadotp = async (req, res) => {
  try {
    const email = req.query.email;
    
    res.render("user/verifyotp", { email: email });
  } catch (error) {
    console.log("Error loading OTP page:", error.message);
  }
};

// const verifyotp = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const enteredOTP =
//       req.body.one + req.body.two + req.body.three + req.body.four;

//     const userOtpRecord = await userotpverification.findOne({ email: email });

//     if (!userOtpRecord) {
//       return res.render("user/verifyotp", {
//         message: `OTP not found`,
//         email,
//       });
//     }

//     const expiresAt = userOtpRecord.expiresAt;

//     if (expiresAt < Date.now()) {
//       return res.render("user/verifyotp", {
//         message: `OTP expired. <a href="/user/loadotp?email=${email}">Try again</a>`,
//         email,
//       });
//     }

//     const { otp: hashedOTP } = userOtpRecord;

//     const validOTP = await bcrypt.compare(enteredOTP, hashedOTP);

//     if (validOTP) {
//       const userData = await User.findOne({ email: email });

//       await User.findByIdAndUpdate({ _id: userData._id }, { is_Verified: 1 });
//       req.session.userId = userData._id;

//       await UserOtpVerification.deleteOne({ email: email });

//       res.redirect("/");
//     } else {
//       return res.render("user/verifyotp", {
//         message: `OTP is incorrect`,
//         email,
//       });
//     }
//   } catch (error) {
//     console.log("Error in verifyotp:", error.message);
//     return res
//       .status(500)
//       .render("error", { message: "Internal Server Error" });
//   }
// };


const verifyotp = async (req, res) => {
  try {
    const email = req.body.email;
    const enteredOTP =
      req.body.one + req.body.two + req.body.three + req.body.four;

    const userOtpRecord = await userotpverification.findOne({ email: email });

    if (!userOtpRecord) {
      return res.render("user/verifyotp", {
        message: `OTP not found`,
        email,
      });
    }

    const expiresAt = userOtpRecord.expiresAt;

    if (expiresAt < Date.now()) {
      return res.render("user/verifyotp", {
        message: "otp expired",
        email,
      });
    }

    const { otp: hashedOTP } = userOtpRecord;

    const validOTP = await bcrypt.compare(enteredOTP, hashedOTP);

    if (validOTP) {
      const userData = await User.findOne({ email: email });

      await User.findByIdAndUpdate({ _id: userData._id }, { is_Verified: 1 });
      req.session.userId = userData._id;

      await UserOtpVerification.deleteOne({ email: email });

      // Returning a JSON response for successful OTP verification
      res.json({ success: true });
    } else {
      // Returning a JSON response for invalid OTP
      res.render("user/verifyotp", {
        message: "Invalid OTP",
        email,
      });    }
  } catch (error) {
    console.log("Error in verifyotp:", error.message);
    // Returning a JSON response for internal server error
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// --------login-------------
const userlogin = async (req, res) => {
  try {
    
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

// verify login-----------
// const verifylogin = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (user) {
//       const passwordMatch = await bcrypt.compare(
//         req.body.Password,
//         user.password
//       );

//       if (passwordMatch) {
//         if (user.is_Verified === 1) {
//           req.session.userId = user._id;
//           return res.redirect("/");
//         } else {
//           await user.deleteOne({ is_Verified: 0 });
//           const message = "User is not verified. Please verify your email.";
//           return res.render("user/login", { messages: { message } });
//         }
//       } else {
//         const message = "The password you entered is not correct.";
//         return res.render("user/login", { messages: { message } });
//       }
//     } else {
//       const message = "Please register your email.";
//       return res.render("user/login", { messages: { message } });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };

// after making the changes in the verifylogin
const verifylogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const passwordMatch = await bcrypt.compare(
        req.body.Password,
        user.password
      );

      if (passwordMatch) {
        if (user.is_Verified === 1) {
          if (user.is_Blocked === 1) {
            // Redirect to the login page with a message indicating that the account is blocked
            res.redirect("/login?message=Your account is blocked.");
            return;
          }
          req.session.userId = user._id;
          return res.redirect("/");
        } else {
          const message = "User is not verified. Please verify your email.";
          return res.render("user/login", { messages: { message } });
        }
      } else {
        const message = "The password you entered is not correct.";
        return res.render("user/login", { messages: { message } });
      }
    } else {
      const message = "Please register your email.";
      return res.render("user/login", { messages: { message } });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};




// after login return after home page

const AfterLogin = async (req, res) => {
  try {

    res.render("user/home");
  } catch (error) {
    console.log( error.message);
  }
};

// forget password 

const loadforgetpassword = async(req,res)=>{
  try {
    res.render("user/forgetpassword")
  } catch (error) {
    console.log(error.message);
  }
}

const forgetpasswordverify = async(req,res)=>{
  try {
    const email = req.body.email

    const Details = await User.findOne({email:email})
   if (Details) {
    if (Details.is_Verified==0) {
      res.render("user/forgetpassword",{message:"Please verify your email"})
    } else {
      const randomstring = randomstrings.generate()
      const updatedetail = await User.updateOne({email:email},{$set:{token:randomstring}})
      sendforgetemail(Details.name,Details.email,randomstring)

      res.render("user/forgetpassword",{message:"Please check your email"})
    }
   } else {
    res.render("user/forgetpassword",{message:"Email is incorrect"})
   }
  } catch (error) {
    console.log(error.message);
  }
}

const sendforgetemail =async(name,email,token)=>{
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailoption = {
      from: process.env.Email_USERNAME,
      to: email,
      subject: "For Reset Password",
      html: '<p>Hii '+name+', please click here to <a href="http://zenvogue.online/forgetpassword?token='+token+'">Reset</a> your password.',
    };
     transporter.sendMail(mailoption)
     console.log("helo namaste");
  } catch (error) {
    console.log(error.message);
  }
}

const forgetpasswordload = async (req,res)=>{
  try {
    
    const token = req.query.token
    console.log("this is ypur token",token)
    const tokendata = await User.findOne({token:token})
    console.log("this is the tokendata",tokendata)
    if (tokendata) {
      res.render("user/passwordforget",{message:"", tokendata: tokendata})
    } else {
      res.redirect("/forget")
    }
  } catch (error) {
    console.log(error.message);
  }
}


const resetpassword = async(req,res)=>{
    try {
      
      const password =req.body.password
      const confirmedpassword = req.body.confirmpassword
     
      const user_id=req.body.user_id

      if (password==confirmedpassword && user_id) {
        const secure_password = await securepassword(password)
        const updatedpassword = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password}})
        res.redirect('/login')
      } else {
        res.render("user/passwordforget",{message:"password does not match"})
      }
  
    } catch (error) {
      console.log(error.message);
    }
  }

// after logouting the account,l.
const userlogout = async (req, res) => {
  try {
    req.session.userId = null;
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};


// To load shop in user side
// const loadshop = async (req, res) => {
//   try {
//     const productdetail = await Product.find({is_Listed: true }).populate(
//       "category"
//     );
//     const products = productdetail.filter((product) => {
//       if (product.category && product.category.is_Listed == 1) {
//         return product;
//       }
//     });
//     res.render("user/shop", { products , user: req.session.userId});
//   } catch (error) {
//     console.log("Error:", error.message);
//   }
// };


const loadshop = async (req, res) => {
  try {
      let query = { is_Listed: true };
      if (req.query.category) {
          query.category = req.query.category;
      }

      // for search
      if (req.query.search) {
        query.name = { $regex: new RegExp(req.query.search, 'i') };
    }

      const productdetail = await Product.find(query).populate({
        path: 'category',
        populate: { path: 'offers' }
      }).populate("offers"); 
           const products = productdetail.filter(product => {
          if (product.category && product.category.is_Listed == 1) {
              return product;
          }
      });

      // Fetch categories for dropdown
      const categories = await Category.find({});

      res.render("user/shop", { products, categories, user: req.session.userId });
  } catch (error) {
      console.log("Error:", error.message);
  }
};


// product details showing 
  const productdetail = async(req,res)=>{
    try {
      
    const productId = req.query.id
    console.log("uifvufvnfuvuvuivui",productId);
    const product= await Product.findById({_id:productId}).populate({
      path: 'category',
      populate: { path: 'offers' }
    }).populate("offers"); 
    
    console.log("the productdetail may here",product);
    res.render("user/productdetail",{data:product,user: req.session.userId})
    } catch (error) {
      console.log(error.message);
    }
    
  }
// my account--------profile&editprofile---------------
const myaccount = async(req,res)=>{
  try {
    const userid = req.session.userId
    const users = await User.findOne({_id:userid})
    users.walletHistory.sort((a, b) => new Date(b.date) - new Date(a.date));



    const userAddress = await Address.findOne({
      user:req.session.userId
    })
  
    const profiledata = await User.findById({_id:userid})
    const orders = await Order.find({user:userid}).sort({Date:-1})
    res.render("user/profile",{profiledata,users,orders,userAddress,user: req.session.userId})
  } catch (error) {
    console.log(error.message);
  }
}

const profilesubmit= async(req,res)=>{
  try {
    const name= req.body.name
    const email=req.body.email
    const mobile=req.body.mobile

     const userid = req.session.userId

    const alemail = await User.findOne({email:email})
    if(alemail){
      await User.updateOne({_id:userid},{$set:{
        name:name,
        mobile:mobile
      }})
    }

    res.redirect("/myaccount")
  } catch (error) {
    console.log(error.message);
  }
}

const downloadinvoice = async (req, res) => {
  try {
   const orderId = req.query.orderId
   const order = await Order.findOne({_id:orderId}).populate({
    path: "product.productId",
    model: "Product",
   }).populate("user")
   
   const date = new Date()
   const data = {
    order:order,
    date,
   }

   const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");
   const html = fs.readFileSync(filepathName).toString();
   const ejsData = ejs.render(html, data);
   const browser = await puppeteer.launch({ headless: "new"});
   const page = await browser.newPage();
   await page.setContent(ejsData, { waitUntil: "networkidle0" });
   const pdfBytes = await page.pdf({ format: "Letter" });
   await browser.close();
   res.setHeader("Content-Type", "application/pdf");
   res.setHeader(
     "Content-Disposition",
     "attachment; filename= orderInvoice_Zenvogue.pdf"
   );
   res.send(pdfBytes);


  } catch (error) {
    console.log(error.message);
    res.status(500).send('Error generating invoice');
  }
}

module.exports = {
  userHome,
  userRegister,
  verifyRegister,
  loadotp,
  verifyotp,
  getSentOtp,
  securepassword,
  userlogin,
  verifylogin,
  AfterLogin,
  userlogout,
  loadshop,
  productdetail,
  loadforgetpassword,
  forgetpasswordverify,
  sendforgetemail,
  forgetpasswordload,
  resetpassword,
  myaccount,
  profilesubmit,
  downloadinvoice,
};
