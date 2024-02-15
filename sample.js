const forgetpasswordload = async (req,res)=>{
    try {
      const token = req.query.token
      const tokendata = await User.findOne({token:token})
      
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
        console.log("------------Password changed---------");
        res.redirect('/login',{message:"password changed"})
      } else {
        res.render("user/passwordforget",{message:"password does not match"})
      }
  
    } catch (error) {
      console.log(error.message);
    }
  }





  <button type="submit" onclick="addToCart('<%= data._id %>')" class="btn btn-danger mx-3">
                        Add To Cart
                      </button>


//   <% if(locals.user) { %>
//     <button> <a href="/logout">Logout</a></button>
//   <% }else{ %>
//     <button> <a href="/login">Login</a></button>
//   <% } %>



// cart addtocart
const addtocart = async (req, res) => {
  try {
      const {userId}=req.session

      if (!userId) {
          return res.json({ session: false, error: 'Please login first' });
      }

      const userdata = await User.findOne({ _id:userId });

      if (!userdata) {
          return res.json({ session: false, error: 'User not found' });
      }

      const productid = req.body.productId;
      const productdata = await Product.findById(productid);

      if (!productdata || productdata.quantity === 0) {
          return res.json({ quantity: false, error: 'Product not found or out of stock' });
      }

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

      return res.json({ success: true, stock: true });
  } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};





// const placetheorder = async (req,res)=>{
//     try {
//         const userId=req.session.userId
//         console.log("user id is here",userId);

//         const userdata = await User.findOne({_id:req.session.userId})
//         console.log("user details are here",userdata);

//         const cartdata= await Cart.findOne({user:userId})
//         console.log("cartdata may here",cartdata);

//         for(const cartProduct of cartdata.product){
//             const productdata = await Product.findOne({_id:cartProduct.productId})
//             console.log("product data may here",productdata);
//             if(cartProduct.quantity > Product.quantity){
//                 res.json({
//                     success:false,
//                     message: `Not enough stock available for product: ${Product.name}`
//                 })
//                 return;
//             }
//         }
//         const subtotal= req.body.subtotal
//         const address = req.body.address
//         const payment =req.body.payyment
//         const exprdate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
//         const products =cartdata.product

//         console.log("all the coonst are here",subtotal,address,payment,exprdate,products);


//         const status =
//         payment === "COD" ?"placed":"pending"
        
//         // backend data storing (mongodb)
//         const neworder = new Order({
//             deliveryDetails:address,
//             user:userdata._id,
//             username:userdata.name,
//             paymentmethod:payment,
//             product:products,
//             subtotal:subtotal,
//             status:status,
//             Date: Date.now(),
//             exprdate:exprdate
//         })  

//         const saveorder = await neworder.save()

//         if(status == "placed"){
//             const deletefromcart=await Cart.findOneAndDelete({user:userId},{product:'product.productId'})
//             console.log("product deleted from cart ",deletefromcart);
//             res.json({success:true})
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }




// sendingotp to email-------
// const sendingotptoemail = async ({ email }, res) => {
//   try {
//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.Email_USERNAME,
//         pass: process.env.Email_PASSWORD,
//       },
//     });

//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//     console.log("Generated OTP:", otp);



//     //mail options-------------
//     const mailoption = {
//       from: "thashreefkhan4@gmail.com",
//       to: email,
//       subject: "Welcome,Verify your email",
//       html: `<p> Enter otp <b> ${otp}</b> in the above to verify your email`,
//     };

//     // hash otp----------------
//     const hashedotp = await bcrypt.hash(otp, 10);
//     const newotpverification = await new UserOtpVerification({
//       email: email,
//       otp: hashedotp,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 3600000  
//       // changes 3600000 to (2 * 60 *1000 ) this
//     });


 

//     await newotpverification.save(); 

//     await transporter.sendMail(mailoption);

//     console.log("OTP Email sent successfully");

//     res.redirect(`user/verifyotp?email=${email}`);
//   } catch (error) {
//     console.log("Error sending OTP email:", error.message);
//   }
// };
