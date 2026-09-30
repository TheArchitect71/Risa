const Product = require("../models/product");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: "",
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty() || !image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0]?.msg || "An image is required",
      validationErrors: errors.array(),
      product: {
        title: title,
        price: price,
        description: description,
      },
    });
  }

  const imageUrl = "images/" + require("path").basename(image.path);
  const product = new Product({
    // The listings on the left are the keys defined in the Schema
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Product Has Been Created.");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: true,
        product: product,
        errorMessage: message,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/edit-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0]?.msg || "An image is required",
      validationErrors: errors.array(),
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
    });
  }
  Product.findById(prodId)
    .then((product) => {
      // @ts-ignore
      if (!product) return res.status(404).json({error:"Product not found"});
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      // @ts-ignore
      product.title = updatedTitle;
      if (image) {
        fileHelper.deleteFile(require("path").join(__dirname,"..",product.imageUrl));
        // @ts-ignore
        product.imageUrl = "images/" + require("path").basename(image.path);
      }
      // @ts-ignore
      product.price = updatedPrice;
      // @ts-ignore
      product.description = updatedDescription;
      return product.save().then((result) => {
        console.log(result);
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    /* Instead of writing nested queries: you can also select which kind of data should be received in find()
  .select('title price -id')
  Populate allows you to tell mongoose to populate a certain field with all the detail
  .populate('userId', 'name')*/
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.deleteProduct = async (req,res,next) => {
 try {const product=await Product.findById(req.params.productId);if(!product)return res.status(404).json({error:'Product not found'});if(product.userId.toString()!==req.user._id.toString())return res.status(403).json({error:'Not authorized'});await Product.deleteOne({_id:product._id,userId:req.user._id});fileHelper.deleteFile(require('path').join(__dirname,'..',product.imageUrl));res.json({message:'Product has been Deleted.'});}catch(error){next(error);}
};
