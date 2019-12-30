const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const keys = require("./keys");
const MongoDBStore = require("connect-mongodb-session")(session);

// Error Handler
const errorController = require("./controllers/error");

// Models
const User = require("./models/user");

//MongoDB URI
const MONGODB_URI =
  `mongodb+srv://theArchitect71:${keys.mongodb}@cluster0-jsigs.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();

//MongoDB Store should be used for production
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

store.on("error", function(error) {
  console.log(error);
});

// Views
app.set("view engine", "ejs");
app.set("views", "views");

// List of Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// Others
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//Session
app.use(
  session({
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// Stores user in session: session contains 'login' value. This session will then be shared to other middleware that require rendering when interacting with the user.
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // @ts-ignore
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// Routes in Use
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// Using mongoose to call MongoDB Database
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Alan",
          email: "alan@test.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen("3000");
  })
  .catch(err => {
    console.log(err);
  });
