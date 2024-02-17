const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_Admin: {
    type: Number,
    required: true,
  },
  is_Verified: {
    type: Number,
    default: 0,
  },
  is_Blocked: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
  wallet: {
    type: Number,
    default: 0,
},
walletHistory: [{
    date: {
        type: Date
    },
    amount: {
        type: Number,
    },
    discription:{
      type:String,
    }
}]
});










UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update && update.is_Blocked) {
    const user = await this.model.findOne(this.getQuery());
    if (user && user.session) {
      user.session.destroy();
    }
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
