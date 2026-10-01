const { body, check } = require("express-validator");
const User = require("../models/user");

exports.validProduct = [
    body("title", "Please Provide a Title ")
      .isString()
      .isLength({ min: 2, max: 140 })
      .trim(),
    body("price", "Please Set a Price").isFloat({ min: 0 }),
    body("description", "Please Provide a Description")
      .isString()
      .isLength({ min: 3, max: 400 })
      .trim(),
    body("sku", "SKU must be 60 characters or fewer")
      .optional({ values: "falsy" }).isString().isLength({ max: 60 }).trim(),
    body("category", "Category must be 60 characters or fewer")
      .optional({ values: "falsy" }).isString().isLength({ max: 60 }).trim(),
    body("quantity", "Quantity must be a whole number of 0 or more")
      .custom(value => value === undefined || value === null || value === '' ||
        (Number.isSafeInteger(Number(value)) && Number(value) >= 0)),
    body("reorderLevel", "Low stock threshold must be a whole number of 0 or more")
      .custom(value => value === undefined || value === null || value === '' ||
        (Number.isSafeInteger(Number(value)) && Number(value) >= 0)),
];

exports.validLogin = [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .normalizeEmail(),
    body("password", "Please input a password at least 8 characters long")
      .isLength({ min: 6, max: 20 })
      .isAlphanumeric()
      .trim(),
];

exports.validSignup = [
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
