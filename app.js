const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1/wanderlust";

main()
.then(() => {
    console.log("Connected to MongoDB.");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/images")));

app.get("/", (req, res) => {
    res.send("Hi, this is root.");
});

/*
app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title: "Farm Villa",
        description: "In Darbhanga Fort",
        price: 5000,
        location: "Darbhanga",
        country: "India",
    });
    await sampleListing.save()
    .then(()=> {
        res.send(sampleListing);
    })
    .catch((err) => {
        console.log(err);
    });
});
*/

// INDEX ROUTE - CREATE ROUTE IN C FOR CRUD
app.get("/listings", async (req, res) => {
    // Listing.find({}).then((res) => {console.log(res);});
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

// NEW ROUTE should be kept above SHOW ROUTE
app.get("/listings/new", async (req, res) => {
    res.render("listings/new.ejs");
});

// SHOW ROUTE - READ ROUTE IN R FOR CRUD
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

// CREATE ROUTE
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save()
    .then(() => {
        console.log(newListing);
        res.redirect("/listings");
    }).catch((err) => {
        console.log(err);
    });
    // let { title, description, image, price, location, country } = req.body;
});

// EDIT ROUTE
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// UPDATE ROUTE
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
})

//DELETE ROUTE
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

app.listen(8080, () => {
    console.log("App is listening at port 8080.");
});
