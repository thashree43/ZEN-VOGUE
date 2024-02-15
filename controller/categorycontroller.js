const categories = require("../model/categoryModel");

const loadcategory = async (req, res) => {
  try {
    const Data = await categories.find();
    res.render("admin/category", { Data: Data });
  } catch (error) {
    console.log(error.message);
  }
};

const addcategory = async (req, res) => {
  try {
    res.render("admin/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};

const editcategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const category = await categories.findById(categoryId);
    res.render("admin/editcategory", { category: category });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const newcategory = async (req, res) => {
  try {
    const name = req.body.categoryName.toUpperCase();
    const description = req.body.categoryDescription.toUpperCase();

    const category = await categories.findOne({ name: name });

    if (category) {
      return res.render("admin/addcategory", {
        messages: { message: "This category already exists" },
      });
    } else {
      const newData = new categories({
        name: name,
        description: description,
      });

      const categoryData = await newData.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Internal Server Error");
  }
};

const deletecategory = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    await categories.deleteOne({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};
const editedcategory = async (req, res) => {
  try {
    const id = req.body.categoryid;
    const name = req.body.categoryName.toUpperCase();
    const description = req.body.categoryDescription.toUpperCase();

    const existingCategory = await categories.findOne({ name: name });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.render("admin/editcategory", {
        messages: { message: "This category already exists" },
      });
    }

    const updatedCategory = await categories.findByIdAndUpdate(
      id,
      { name: name, description: description },
      { new: true }
    );

    if (!updatedCategory) {
      return res.render("admin/editcategory", {
        messages: { message: "Category not found" },
      });
    }

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const Listed = async (req, res) => {
  try {
    await categories.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { is_Listed: 1 } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const Unlisted = async (req, res) => {
  try {
    await categories.updateOne(
      { _id: req.query.id },
      { $set: { is_Listed: 0 } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    console.error("Unlisted error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadcategory,
  addcategory,
  editcategory,
  newcategory,
  deletecategory,
  editedcategory,
  Listed,
  Unlisted,
};
