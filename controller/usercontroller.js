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

// ----verify registration----
const verifyRegister = async (req, res) => {
  try {
    const existuser = await User.findOne({ email: req.body.email });
    if (existuser && existuser.is_Verified) {
      const message = "Email already registered";
      res.render("user/Register", { message });
    } else if (existuser && !existuser.is_Verified) {
      const message =
        "Email already registered but not verified. So send OTP to email and verify the email";
      res.render("user/Register", { message });
    } else {
      const bodypassword = req.body.password;
      const confirmPassword = req.body.confirmPassword;
      const spassword = await securepassword(bodypassword);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobileNumber,
        password: spassword,
        confirmPassword: confirmPassword,
        is_Admin: 0,
      });

      if (bodypassword !== confirmPassword) {
        return res.render("user/Register", {
          message: "Passwords do not match",
        });
      }

      const userdata = await user.save();
      req.session.email = req.body.email;
      await sendOtpVerificationMail(userdata, res);
    }
  } catch (error) {
    console.log(error.message);
  }
};



// impoting from utilis
const getSentOtp = async(req,res)=>{
  try {
    await sendOtpVerificationMail({email:req.session.email},res)
  } catch (error) {
    console.log(error.message);
  }
}

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
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
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
        user: process.env.Email_USERNAME,
        pass: process.env.Email_PASSWORD,
      },
    });
    const mailoption = {
      from: process.env.Email_USERNAME,
      to: email,
      subject: "For Reset Password",
      html: '<p>Hii '+name+', please click here to <a href="http://127.0.0.1:9000/forgetpassword?token='+token+'">Reset</a> your password.',
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
const loadshop = async (req, res) => {
  try {
    const productdetail = await Product.find({is_Listed: true }).populate(
      "category"
    );
    const products = productdetail.filter((product) => {
      if (product.category && product.category.is_Listed == 1) {
        return product;
      }
    });
    res.render("user/shop", { products , user: req.session.userId});
  } catch (error) {
    console.log("Error:", error.message);
  }
};

// product details showing 
 const productdetail = async(req,res)=>{
  try {
    
   const productId = req.query.id
   console.log("uifvufvnfuvuvuivui",productId);
   const product= await Product.findById({_id:productId})
  .populate("category")
   res.render("user/productdetail",{data:product,user: req.session.userId})
  } catch (error) {
    console.log(error.message);
  }
  
 }
// my account--------profile&editprofile---------------
const myaccount = async(req,res)=>{
  try {
    const userid = req.session.userId
    const userAddress = await Address.findOne({
      user:req.session.userId
    })
  
    const profiledata = await User.findById({_id:userid})
    const orders = await Order.find({user:userid}).sort({Date:-1})
    res.render("user/profile",{profiledata,orders,userAddress,user: req.session.userId})
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
 
};
