const { body, check } = require("express-validator");
const User = require("../models/user");

exports.validProduct = (req, res, next) => {
  [
    body("title", "Please Provide a Title ")
      .isLength({ min: 1, max: 140 })
      .isString()
      .trim(),
    body("price", "Please Set a Price").isFloat(),
    body("description", "Please Provide a Description")
      .isLength({ min: 3, max: 400 })
      .trim(),
  ];
  next();
};

exports.validLogin = (req, res, next) => {
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .normalizeEmail(),
    body("password", "Please input a password at least 8 characters long")
      .isLength({ min: 6, max: 20 })
      .isAlphanumeric()
      .trim(),
  ];
  next();
};

exports.validSignup = (req, res, next) => {
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("This e-mail exists already");
          }
        });
      })
      .normalizeEmail(),
    /*The second parameter will be the message for errors */
    body("password", "Please input a password at least 8 characters long")
      /*Password should be at least 8 characters long in production
        and require uppercase, lowercase, number, and symbol*/
      .trim()
      .isLength({ min: 6, max: 20 })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
  next();
};
