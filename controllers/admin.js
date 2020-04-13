const Product = require("../models/product");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: message,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/add-product",
      pageTitle: "Add Product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      }
    });
  }
  const product = new Product({
    // The listings on the left are the keys defined in the Schema
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch(err => {
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
    .then(product => {
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
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      path: "/edit-product",
      pageTitle: "Edit Product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId
      }
    });
  }
  Product.findById(prodId)
    .then(product => {
      // @ts-ignore
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      // @ts-ignore
      product.title = updatedTitle;
      // @ts-ignore
      product.price = updatedPrice;
      // @ts-ignore
      product.description = updatedDescription;
      // @ts-ignore
      product.imageUrl = updatedImageUrl;
      return product.save()
      .then(result => {
        console.log(result);
        res.redirect("/admin/products");
      })
    })
    .catch(err => {
      const error = new Error(err);
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  /* Instead of writing nested queries: you can also select which kind of data should be received in find()
  .select('title price -id')
  Populate allows you to tell mongoose to populate a certain field with all the detail
  .populate('userId', 'name')*/
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
      console.log("Deleted Product");
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      return next(error);
    });
};
