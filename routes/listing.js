const express= require('express');
const router=express.Router();
const Listing=require('../models/listing.js');

const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/expressError.js');
const {listingSchema}=require('../schema.js');
const Review = require('../models/review.js');
const User = require('../models/user.js');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');

const upload = multer({ storage });





router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
}));

// New Route --->
router.get('/new', (req, res) => {
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in to create a listing!');
        res.redirect('/login');
    }
    res.render('listings/new.ejs');
});

// Show Route --->
router.get('/:id', wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to see the listing!');
        return res.redirect('/login');  
    }
    
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path:'reviews',populate:({path:"author"})}).populate('owner');
    console.log(listing);
    res.render('listings/show.ejs', { listing });
}));


// Add Route --->
router.post('/',upload.single("listing[image]"), wrapAsync(async (req, res) => {
    //Validate the request body using the schema
    const { error } = listingSchema.validate(req.body);
    if (error) {
        console.log(error)
        req.flash('error', `Validation Error: ${error.details[0].message}`);
        return res.redirect('/listings');  // Redirect with an error message
    }
    let url=req.file.path;
    let filename=req.file.filename;
    // Create a new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename}

    await newListing.save();
    console.log(newListing);

    // Set a success flash message
    req.flash('success', 'Successfully created a new listing!');
    return res.redirect('/listings');  // Redirect to the listings page
}));


        
     


// Edit Route --->
router.get('/:id/edit', wrapAsync(async (req, res) => {
   
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in to create a listing!');
        res.redirect('/login');
    }
     const { id } = req.params;
    const listing = await Listing.findById(id);
    
    res.render('listings/edit.ejs', { listing });
}));

// Update Route --->
router.put('/:id', upload.single("listing[image]"),wrapAsync(async (req, res) => {
   
    const { id } = req.params;
    listingSchema.validate(req.body);
    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !== 'undefined'){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename}
    await listing.save();}
    req.flash('success','Successfully updated listing!');
    res.redirect('/listings');
}));

// Delete Route --->
router.delete('/:id', wrapAsync(async (req, res) => {
   
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in to create a listing!');
        res.redirect('/login');
    }
     const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success','Deleted Listing!');
    res.redirect('/listings');
}));
 
module.exports = router; 


