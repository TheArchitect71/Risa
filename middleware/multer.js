const path=require('node:path');const fs=require('node:fs');fs.mkdirSync(path.join(__dirname,'../images'),{recursive:true});
const multer = require("multer");

exports.fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"../images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + path.basename(file.originalname));
  },
});

exports.fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
