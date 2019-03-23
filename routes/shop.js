const express = require("express");

const router = express.Router();

router.get('/',(req, res, next) => {
    console.log('Hello');
    res.send('<h1>Hello from Express</h1>');
});

module.exports = router