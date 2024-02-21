const Order =require("../model/orderModel")
const Product=require("../model/productmodel")
const Offer = require("../model/offerModel")

const offeraddmin = async(req,res)=>{
    try {
        res.render("admin/offer")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    offeraddmin,
}