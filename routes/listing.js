const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../MIDDLEWARE.js");

const listingController = require("../controllers/listing.js");
const multer  = require("multer");
const {cloudinary, storage} = require("../cloudConfig");
const upload = multer({storage: storage});  
// const upload = multer({ dest: 'uploads/' });

// New route for filtering listings by category
// router.get("/", async (req, res) => {
//     let filter = req.query.category ? { category: req.query.category } : {};
//     const allListings = await Listing.find(filter);
//     res.render("listings/index.ejs", { allListings });
// });
router.get("/", async (req, res) => {
    let filter = req.query.category ? { category: req.query.category } : {};
    let locationFilter = req.query.location ? { $or: [
        { location: { $regex: new RegExp(req.query.location, 'i') } },
        { country: { $regex: new RegExp(req.query.location, 'i') } }
    ] } : {};
    const allListings = await Listing.find({ ...filter, ...locationFilter });
    res.render("listings/index.ejs", { allListings });
});

// CREATE ROUTE IN C FOR CRUD OPERATIONS
router
    .route("/")
    .get(wrapAsync(listingController.index))  // INDEX ROUTE
    .post(
        isLoggedIn, 
        upload.single("listing[image]"), 
        validateListing, 
        wrapAsync(listingController.createListing)
    );  // CREATE ROUTE
    // .post(upload.single("listing[image]"), (req, res) => {
    //     console.log(req.file.path);
    //     res.send(req.file);
    // });
    
// NEW ROUTE should be kept above SHOW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))  // SHOW ROUTE
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("listing[image]"), 
        validateListing, 
        wrapAsync(listingController.updateListing)
    )  // UPDATE ROUTE
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));  // DELETE ROUTE

// EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;