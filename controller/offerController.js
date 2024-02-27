const Order =require("../model/orderModel")
const Product=require("../model/productmodel")
const Offer = require("../model/offerModel")
const Category = require("../model/categoryModel")

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
            discount:req.body.discount,
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

const applycategoryoffer = async (req, res) => {
    try {
        const { id, catid } = req.body;
        console.log("Offer ID:", id);
        console.log("Category ID:", catid);

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: catid },
            { $push: { offers: id } }, // Use $push to add the offer ID to the array
            { new: true }
        );

        console.log("Updated Category:", updatedCategory);
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: "Failed to apply offer. Please try again." });
    }
};


const removecategoryoffer = async (req, res) => {
    try {
      const offerId = req.body.id;
      console.log("Offer ID for removing offer:", offerId);
  
      const updatedCategory = await Category.findOneAndUpdate(
        { offers: offerId },
        { $pull: { offers: offerId } }, // Use $pull to remove the offer from the array
        { new: true }
      );
  
      console.log("Updated Category after removing offer:", updatedCategory);
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: "Failed to remove offer. Please try again." });
    }
  };
  

  const applyproductoffer = async (req, res) => {
    try {
        const { id, proid } = req.body;
        console.log("the id and proid", id, proid); // Corrected variable name
        const prdoff = await Product.findOneAndUpdate(
            { _id: proid },
            { $push: { offers: id } },
            { new: true }
        );
        console.log("after adding the offer ", prdoff);
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
    }
};

const removeproductoffer = async(req,res)=>{
    try {
        const offerId = req.body.id;
      console.log("Offer ID for removing offer:", offerId);
  
      const updatedProduct = await Product.findOneAndUpdate(
        { offers: offerId },
        { $pull: { offers: offerId } }, // Use $pull to remove the offer from the array
        { new: true }
      );
  
      console.log("Updated Product after removing offer:", updatedProduct);
      res.json({ success: true });
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    offeraddmin,
    addofferadmin,
    postaddoffer,
    deleteoffer,
    applycategoryoffer,
    removecategoryoffer,
    applyproductoffer,
    removeproductoffer,
}