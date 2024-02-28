const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Otp = require("../model/userotpverification");


// transporter creating
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_USERNAME,
    pass: process.env.Email_PASSWORD,
  },
});

// sentotpt to email
const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("Generated OTP:", otp);

    //mail options-------------
    const mailoption = {
      from: "thashreefkhan4@gmail.com",
      to: email,
      subject: "Welcome,Verify your email",
      html: `<p> Enter otp <b> ${otp}</b> in the above to verify your email`,
    };

    // hash otp----------------
    //   const hashedotp = await bcrypt.hash(otp, 10);
    //   const newotpverification = await new UserOtpVerification({
    //     email: email,
    //     otp: hashedotp,
    //     createdAt: Date.now(),
    //     expiresAt: Date.now() + 3600000
    //     // changes 3600000 to (2 * 60 *1000 ) this
    //   });

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    await Otp.updateOne(
      { email },
      {
        otp: hashedOtp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      },
      { upsert: true }
    );

    //   await newotpverification.save();

    await transporter.sendMail(mailoption);

    console.log("OTP Email sent successfully");

    res.redirect(`/user/verifyotp?email=${email}`);
  } catch (error) {
    console.log("Error sending OTP email:", error.message);
  }
};

module.exports = {
  transporter,
  sendOtpVerificationMail,
};
