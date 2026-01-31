const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mailer = require("../helper/mailer");
const PasswordReset = require("../models/password");
const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const deleteFile = require("../helper/deleteFile");
const path = require("path");
const crypto = require("crypto");
const BlacklistedToken = require("../models/blacklist");
const OTP = require("../models/otp");

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }
    const { name, email, mobile, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPasswod = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile,
      password: hashPasswod,
      image: "/images/" + req.file.filename,
    });

    const userData = await newUser.save();

    // send mail to user after registration

    const msg = `<h1>Welcome to our platform, ${name}!</h1>
    <p>Thank you for registering with us. We're excited to have you on board.</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="http://localhost:4000/api/verify-email?email=${email}">Verify Email</a>
    <p>Best regards,<br/>The Team</p>`;

    await mailer.sendMail(email, "For Verification", msg);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(400).json({
      success: false,
      message: "Error registering user",
    });
  }
};

const mailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }
    if (req.query._id === undefined) {
      res.status(400).json({
        success: false,
        message: "Invalid verification link",
      });
    }
    const { email } = req.query;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }

    if (user.isVerified) {
      res.json({
        success: true,
        message: "Email is already verified",
      });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(400).json({
      success: false,
      message: "Error verifying email",
    });
  }
};

const sendVerificationMail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // send mail verification link to user

    const msg = `<h1>Email Verification</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="http://localhost:4000/api/verify-email?email=${email}">Verify Email</a>
    <p>Best regards,<br/>The Team</p>`;

    await mailer.sendMail(email, "For Verification", msg);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error sending verification mail:", error);
    return res.status(400).json({
      success: false,
      message: "Error sending verification mail",
    });
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      msg: "Validation errors",
      errors: errors.array(),
    });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate password reset token and send email logic goes here

    const resetToken = randomstring.generate(32);
    const expiresAt = Date.now() + 3600000; // Token valid for 1 hour

    const passwordResetEntry = new PasswordReset({
      userId: user._id,
      resetToken,
      expiresAt,
    });

    await PasswordReset.deleteMany({ userId: user._id }); // Remove existing tokens for the user
    await passwordResetEntry.save();

    const resetLink = `http://localhost:4000/api/reset-password?token=${resetToken}`; // Example reset link with reset token

    const msg = `<h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>`;

    await mailer.sendMail(email, "Password Reset", msg);
    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error processing password reset:", error);
    return res.status(400).json({
      success: false,
      message: "Error processing password reset",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }

  try {
    const passwordResetToken = await PasswordReset.findOne({
      resetToken: token,
    });

    if (!passwordResetToken || passwordResetToken.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(400).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

const updatePassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirm password do not match",
    });
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }

  try {
    const passwordResetToken = await PasswordReset.findOne({
      resetToken: token,
    });

    if (!passwordResetToken || passwordResetToken.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Update the user's password
    const user = await User.findById(passwordResetToken.userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove the used password reset token
    await PasswordReset.deleteOne({ _id: passwordResetToken._id });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(400).json({
      success: false,
      message: "Error updating password",
    });
  }
};

const generateAccessToken = (user) => {
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return accessToken;
};

const generateRefreshToken = (user) => {
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return refreshToken;
};

const hashToken = (token) => {
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return hashedRefreshToken;
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user); // Generate refresh token

    user.refreshToken = hashToken(refreshToken); // Store hashed refresh token in user model
    user.refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiry
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

const updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      msg: "Validation errors",
      errors: errors.array(),
    });
  }

  try {
    // User ID must come from verified JWT, not request body
    // Usually stored in req.user by auth middleware
    const userID = req.user.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
    }

    const { name, mobile } = req.body;

    const userdata = {
      name,
      mobile,
    };

    // if image is uploaded
    if (req.file) {
      userdata.image = "/images/" + req.file.filename;

      // Delete old image file if exists
      const oldUser = await User.findById(userID);

      if (oldUser && oldUser.image) {
        const oldImagePath = path.join(__dirname, "../public" + oldUser.image);
        deleteFile(oldImagePath);
      }
    }

    const updatedData = await User.findByIdAndUpdate(userID, userdata, {
      new: true,
      runValidators: true,
    });

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  if (!req.cookies) {
    return res.status(400).json({
      success: false,
      message: "Cookies not available. Did you enable cookie-parser?",
    });
  }

  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const hashed = hashToken(token);

  const user = await User.findOne({
    refreshToken: hashed,
    refreshTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  // 🔄 Rotate refresh token
  const newRefreshToken = generateRefreshToken();
  user.refreshToken = hashToken(newRefreshToken);
  user.refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const accessToken = generateAccessToken(user);

  res.json({
    success: true,
    accessToken,
  });
};

const logoutUser = async (req, res) => {
  try {
    const userID = req.user.id;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Blacklist or invalidate tokens as needed
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(400).json({
        success: false,
        msg: "No token found in request",
      });
    }

    // check if token is already blacklisted
    const existingBlacklistedToken = await BlacklistedToken.findOne({ token });
    if (existingBlacklistedToken) {
      return res.status(400).json({
        success: false,
        message: "Token is already blacklisted",
      });
    }

    const newBlacklistedToken = new BlacklistedToken({
      token: token,
      blacklistedAt: Date.now(),
    });

    await newBlacklistedToken.save();

    // Invalidate refresh token
    user.refreshToken = null;
    user.refreshTokenExpiry = null;
    await user.save();

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email",
    });
  }

  const checkUser = await User.findOne({ email });
  if (!checkUser) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const otp = generateOTP();
  const otpEntry = new OTP({
    email,
    otp,
    attempts: 0, // reset attempts to 0
    expiresAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minutes expiry
  });

  try {
    await OTP.deleteMany({ email }); // Remove existing OTPs for the email
    const hashedOTP = await bcrypt.hash(otp, 10);
    otpEntry.otp = hashedOTP;
    await otpEntry.save();

    const msg = `<h1>Your OTP Code</h1>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>`;

    await mailer.sendMail(email, "OTP Verification", msg);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending OTP",
    });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and OTP",
    });
  }

  try {
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email",
      });
    }

    if (otpEntry.attempts >= 3) {
      await OTP.deleteOne({ _id: otpEntry._id });
      return res.status(400).json({
        success: false,
        message:
          "Maximum OTP verification attempts exceeded. Please request a new OTP.",
      });
    }

    const expirytime = otpEntry.expiresAt;
    if (expirytime < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpEntry.otp);
    if (!isMatch) {
      otpEntry.attempts += 1;
      await otpEntry.save();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid, delete it
    await OTP.deleteOne({ _id: otpEntry._id });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
    });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email",
    });
  }

  const checkUser = await User.findOne({ email });
  if (!checkUser) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const storedOTP = await OTP.findOne({ email });
  if (storedOTP && storedOTP.expiresAt > Date.now()) {
    return res.status(400).json({
      success: false,
      message:
        "Previous OTP is still valid. Please wait before requesting a new one.",
    });
  }

  try {
    const otp = generateOTP();
    const otpEntry = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minutes expiry
    });

    await OTP.deleteMany({ email }); // Remove existing OTPs for the email
    const hashedOTP = await bcrypt.hash(otp, 10);
    otpEntry.otp = hashedOTP;
    await otpEntry.save();

    const msg = `<h1>Your OTP Code</h1>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>`;

    await mailer.sendMail(email, "OTP Verification", msg);

    return res.status(200).json({
      success: true,
      message: "OTP resent to email successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error resending OTP",
    });
  }
};

module.exports = {
  registerUser,
  mailVerification,
  sendVerificationMail,
  forgotPassword,
  resetPassword,
  updatePassword,
  loginUser,
  getUserProfile,
  updateUserProfile,
  refreshToken,
  logoutUser,
  sendOTP,
  verifyOTP,
  resendOTP,
};
