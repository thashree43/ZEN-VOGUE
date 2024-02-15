// const User= require('../model/userModel')

// const isLogin = async (req,res,next)=>{
//     try {
//         if (req.session.userId) {
//             if (req.path === '/login') {
//                 res.redirect('/home')
//                 return
                
//             }
//             next()
//         } else {
//             res.redirect('/login')
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// const isLogout = async (req, res, next) => {
//     try {

        
//         if (req.session.user_id) {
          
//             res.redirect('/home');
//             return;
//         }

       
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports={
//     isLogin,
//     isLogout,
// }


const User = require('../model/userModel');

const isLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    if (!user || user.is_Blocked === 1) {
      req.session.destroy();
      res.redirect('/login');
      return;
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect('/home');
      return;
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};