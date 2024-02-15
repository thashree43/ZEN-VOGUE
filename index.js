const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/zenvogue");


// Import required modules-------------------------- 
const express = require("express");
const path = require("path");
const session = require("express-session");
// 
const MongoStore = require("connect-mongo")(session);
// 
const flash =require('express-flash')
const app = express();
const nocache = require("nocache");
require("dotenv").config();
const port =9000;

// view engine---------------------------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(nocache());

// session---------------------------------------

app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(flash())
// route--------------------------------------------
const userRoute = require("./routes/userroute");
app.use("/", userRoute);

const adminRoute= require("./routes/adminroute")
app.use("/admin",adminRoute)

//  user server port---------------------------------------
app.listen(port, () => {
  // user
  console.log(`server is running on http://localhost:${port}`);
  // admin
  console.log(`server is running on http://localhost:${port}/admin`);

});
