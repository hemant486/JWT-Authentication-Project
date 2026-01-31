const express = require("express");
const multer = require("multer");
const path = require("path");
const userController = require("../controller/userController");
const {
  registerValidation,
  sendMailValidation,
  passwordResetValidation,
  updateProfileValidation,
} = require("../helper/validations");
const userRouter = express.Router();
const authVerify = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, path.join(__dirname, "../public/images"));
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  filename: function (req, file, cb) {
    const name = file.originalname + Date.now();
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// External Routes [No Authentication Required]
userRouter.post(
  "/register",
  upload.single("image"),
  registerValidation,
  userController.registerUser,
);

userRouter.post(
  "/send-verification-mail",
  sendMailValidation,
  userController.sendVerificationMail,
);

userRouter.post(
  "/forgot-password",
  passwordResetValidation,
  userController.forgotPassword,
);

// Login Route [ Authentication Required]

userRouter.get("/profile", authVerify, userController.getUserProfile);

userRouter.post(
  "/update-profile",
  upload.single("image"),
  authVerify,
  updateProfileValidation,
  userController.updateUserProfile,
);

userRouter.get("/refresh-token", userController.refreshToken);

userRouter.get("/logout", authVerify, userController.logoutUser);

userRouter.post(
  "/send-otp",
  authVerify,
  sendMailValidation,
  userController.sendOTP,
);

userRouter.post("/verify-otp", authVerify, userController.verifyOTP);
userRouter.post("/resend-otp", authVerify, userController.resendOTP);

module.exports = userRouter;
