const Order =require("../model/orderModel")
const Product=require("../model/productmodel")
const Offer = require("../model/offerModel")

const offeraddmin = async(req,res)=>{
    try {
        const offers= await Offer.find()
        console.log("the offer be this ",offers);
        res.render("admin/offer",{offers})
    } catch (error) {
        console.log(error.message);
    }
}


const addofferadmin = async (req,res)=>{
    try {
        res.render("admin/addoffer")
    } catch (error) {
        console.log(error.message);
    }
}

const postaddoffer = async(req,res)=>{
    try {
        const data = new Offer({
            name:req.body.name,
            discountamount:req.body.discount,
            activationdate:req.body.activationDate,
            expireddate:req.body.expiryDate
        })

        const offerdata = await data.save()
        res.redirect("/admin/offer")
    } catch (error) {
        console.log(error.message);
    }
}

const deleteoffer = async(req,res)=>{
    try {
        const Id = req.body.offerId
        console.log("the id for deleting the offer is ",Id);
        const deleteoffer = await Offer.deleteOne({_id:Id})
        console.log("the offer has been deleted",deleteoffer);
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    offeraddmin,
    addofferadmin,
    postaddoffer,
    deleteoffer,
}