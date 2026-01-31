const express = require("express");
const userController = require("../controller/userController");
const { loginValidation } = require("../helper/validations");

const authRouter = express.Router();

authRouter.get("/verify-email", userController.mailVerification);

authRouter.post("/reset-password", userController.resetPassword);

authRouter.post("/update-password", userController.updatePassword);

authRouter.post("/login", loginValidation, userController.loginUser);

module.exports = authRouter;
