const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const keys = require("./keys");
const MongoDBStore = require("connect-mongodb-session")(session);
const crsf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { fileStorage, fileFilter } = require("./middleware/multer");

// Error Handler
const errorController = require("./controllers/error");

// Models
const User = require("./models/user");

//MongoDB URI
const MONGODB_URI = `mongodb+srv://theArchitect71:${keys.mongodb}@cluster0-jsigs.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();
// Views
app.set("view engine", "ejs");
app.set("views", "views");

// List of Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

//MongoDB Store should be used for production
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

const crsfProtection = crsf();

//Session
app.use(
  // @ts-ignore
  session({
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

//Image Upload
// @ts-ignore
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

// Others
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// @ts-ignore
app.use(flash());
app.use(crsfProtection);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Stores user in session: session contains 'login' value. This session will then be shared to other middleware that require rendering when interacting with the user.
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      // @ts-ignore
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// Routes in Use
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error routes
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
  });
});
app.get("/500", errorController.get500);

// Using mongoose to call MongoDB Database
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen("3000");
  })
  .catch((err) => {
    console.log(err);
  });
