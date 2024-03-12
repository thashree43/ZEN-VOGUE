const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Otp = require("../model/userotpverification");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp);

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

    const mailoption = {
      from: process.env.Email_USERNAME,
      to: email,
      subject: "Welcome,Verify your email ",
      html: `<p> Enter otp <b> ${otp}</b> in the above to verify your email`,
    };

    await transporter.sendMail(mailoption);

    console.log("OTP Email sent successfully");

    res.redirect("/user/verifyotp?email=" + email);
  } catch (error) {
    console.log("Error sending OTP email:", error.message);
  }
};

module.exports = { transporter, sendOtpVerificationMail };