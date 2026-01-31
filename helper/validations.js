const { check } = require("express-validator");

const registerValidation = [
  check("name", "Name is requiresd").not().isEmpty(),
  check("email", "Please provide a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("mobile", "Mobile number is required").not().isEmpty().isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be at least 6 characters - one uppercase, one lowercase, one number and one special character",
  ).isStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),

  check("image").custom((value, { req }) => {
    if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/png" ||
      req.file.mimetype === "image/jpg"
    ) {
      return true;
    } else {
      throw new Error("Only .png, .jpg and .jpeg format allowed!");
    }
  }),
];

const sendMailValidation = [
  check("email", "Please provide a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

const passwordResetValidation = [
  check("email", "Please provide a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

const loginValidation = [
  check("email", "Please provide a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "Password is required").not().isEmpty(),
];

const updateProfileValidation = [
  check("name")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Name cannot be empty if provided"),
  check("mobile")
    .optional()
    .isLength({
      min: 10,
      max: 10,
    })
    .withMessage("Mobile number must be 10 digits if provided"),
];

module.exports = {
  registerValidation,
  sendMailValidation,
  passwordResetValidation,
  loginValidation,
  updateProfileValidation,
};
