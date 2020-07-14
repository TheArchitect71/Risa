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
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        price: price,
        description: description,
      },
    });
  }

  const imageUrl = image.path;
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
      errorMessage: errors.array()[0].msg,
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
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      // @ts-ignore
      product.title = updatedTitle;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        // @ts-ignore
        product.imageUrl = image.path;
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

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("Deleted Product");
      res.status(200).json({
        message: "Product has been Deleted."
      })
    })
    .catch((err) => {
      res.status(500).json({
        message: "Deleting Product Failed."
      });
    });
};
