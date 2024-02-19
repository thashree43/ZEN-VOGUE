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












// <!-- <script>
//     document.addEventListener('DOMContentLoaded', function () {
//       let countdown = 60; // 1 minutes in seconds
//     const otpForm = document.getElementById('otpForm');
//     const resendButton = document.getElementById('resendOTPBtn'); // Changed the id
//     const timerDisplay = document.getElementById('timerDisplay');
//     const userMessage = document.getElementById('user-message');
//     console.log(timerDisplay)
    
//     let timer;
    
    
//     function updateTimerDisplay() {
//         const minutes = Math.floor(countdown / 60);
//         const seconds = countdown % 60;
//         timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//     }
    
//     function startTimer() {
//         timer = setInterval(function () {
//             countdown--;
//             updateTimerDisplay();
    
//             if (countdown <= 0) {
//                 clearInterval(timer);
//                 countdown = 0;
//                 updateTimerDisplay();
//                 resendButton.disabled = false;
//                 resendButton.classList.add('afterTimer');
//             }
//         }, 1000);
//     }
    
//     updateTimerDisplay(); // Initial display
    
    // Start the timer when the page loads
    // startTimer();
    
    // // Add event listener to the "Resend" button
    // resendButton.addEventListener('click', function () {
    //     fetch('/sentOtp'); // Changed the endpoint
    //     countdown = 60; // Reset the countdown to  minutes
    //     updateTimerDisplay();
    //     resendButton.disabled = true;
    //     resendButton.classList.remove('afterTimer');
    //     userMessage.style.display = 'block';
    //     // Disable the button again
    //     startTimer(); // Start the timer again
    // });
  //   resendButton.addEventListener('click', function () {
  // if (countdown <= 0) {
  //   fetch('/sentOtp'); // Changed the endpoint
  //   countdown = 60; // Reset the countdown to 1 minutes
//     updateTimerDisplay();
//     resendButton.disabled = true;
//     resendButton.classList.remove('afterTimer');
//     userMessage.style.display = 'block';
//     // Disable the button again
//     startTimer(); // Start the timer again
//   }
// });
// });

//   </script> -->



    // function applyCoupon(id) {
    //   console.log("the id may here", id)
    //   $.ajax({
    //     url: "/applycoupon",
    //     method: 'post',
    //     data: {
    //       id
    //     },
    //     success: (response) => {
    //       console.log(response)
    //       if (response.coupon == false) {
    //         Swal.fire({
    //           title: "No Coupon Available",
    //           icon: "error",
    //           confirmButtonText: "OK",
    //         })
    //       } else if (response.coupon == "AlreadyUsed") {
    //         Swal.fire({
    //           title: " The Coupon has alraedy used",
    //           icon: "info",
    //           confirmButtonText: "OK",
    //         })
    //       } else if (response.coupon == "Already Applied") {
    //         Swal.fire({
    //           title: "The Coupon is in Active",
    //           icon: "info",
    //           confirmButtonText: "OK",
    //         })
    //       } else if (response.coupon == 'expired') {
    //         Swal.fire({
    //           title: "Oops",
    //           text: "The Coupon has expired",
    //           icon: "info",
    //           confirmButtonText: "OK",
    //         })
    //       } else if (response.coupon) {
    //         console.log("the coupon has place succefully ",response.coupon);
    //         Swal.fire({
    //           title: "Success",
    //           text: "Coupon added successfully!",
    //           icon: "success",
    //           confirmButtonText: "OK",
    //         }).then((result) => {
    //           if (result.isConfirmed) {
    //             const code = response.coupondata.couponcode

    //             console.log(code, 'vdsij');
    //             $('#c_code').val(code);
    //             $('#exampleModal').modal('hide');
    //             $('#reloadDiv').load('/checkout #reloadDiv');
    //             $('#reloadAmount').load('/checkout #reloadAmount');
    //           }
    //         });
    //       } else {
    //         Swal.fire({
    //           title: "Something Wrong",
    //           icon: "error",
    //           confirmButtonText: "OK",

    //         })
    //       }
    //     }
    //   })
    // }