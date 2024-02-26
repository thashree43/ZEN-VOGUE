const mongoose = require("mongoose")

const OfferSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discountamount:{
        type:Number,
        required:true
    },
    activationdate:{
        type:Date,
        required:true
    },
    expireddate:{
        type:Date,
        required:true
    },
    is_Blocked:{
        type:Boolean,
        required:false
    }
})

module.exports = mongoose.model("offer",OfferSchema)