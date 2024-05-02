if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
// console.log(process.env.secret);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/<yourMongoDB>";
const dbUrl = process.env.ATLASDB_URL;
const store = MongoStore.create(
    {
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    }
);
store.on("error", () => {
    console.log("Error occurred in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now(), // + 7 * 24 * 60 * 60 * 1000
        maxAge: null,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/images")));

main()
.then(() => {
    console.log("Connected to MongoDB.");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use((req, res, next) => {
    // console.log(res.locals.success);
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // important for passing user information to signup, login and logout in views/includes/navbar.ejs
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});
app.listen(8080, () => {
    console.log("App is listening at port 8080.");
});