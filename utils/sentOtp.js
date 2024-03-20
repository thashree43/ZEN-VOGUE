const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Otp = require("../model/userotpverification");

// Create a transporter with appropriate configurations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send OTP verification email
const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    if (!email) {
      throw new Error("Email address is required");
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp);

    // Hash OTP for security
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Save hashed OTP in the database
    await Otp.updateOne(
      { email },
      {
        otp: hashedOtp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      },
      { upsert: true }
    );

    // Compose email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Welcome, Verify your email",
      html: `<p>Enter OTP <b>${otp}</b> to verify your email</p>`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("OTP Email sent successfully");

    // Redirect user to OTP verification page
    res.redirect("/user/verifyotp?email=" + email);
  } catch (error) {
    // Handle errors
    console.log("Error sending OTP email:", error.message);
    res.status(500).json({ error: "Error sending OTP email" });
  }
};

module.exports = { transporter, sendOtpVerificationMail };
