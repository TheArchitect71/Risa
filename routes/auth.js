const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login",
[
  check("email")
    .isEmail()
    .withMessage("Please Enter a Valid Email"),
    body("password", "Please input a password at least 8 characters long")
    .isLength({min: 6, max: 20})
    .isAlphanumeric()
], authController.postLogin);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("This e-mail exists already");
          }
        });
      }),
    /*The second parameter will be the message for errors */
    body("password", "Please input a password at least 8 characters long")
      /*Password should be at least 8 characters long in production
    and require uppercase, lowercase, number, and symbol*/
      .isLength({ min: 6, max: 20 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.passowrd) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
