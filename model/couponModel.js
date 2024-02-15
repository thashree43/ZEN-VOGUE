const mongoose=require("mongoose")

const CouponModel = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    couponcode:{
        type:String,
        required:true
    },
    discountamount:{
        type:Number
    },
    activateDate:{
        type:Date,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    criteriaamount:{
        type:Number,
        required:true
    },
    useduser:{
        type:Array,
        ref:"user",
        default:[]
    }
})

module.exports=mongoose.model("Coupon",CouponModel)