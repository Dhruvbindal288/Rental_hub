const express= require('express');
const router=express.Router({mergeParams:true});
const {listingSchema,reviewSchema}=require('../schema.js');
const Review = require('../models/review.js');

const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/expressError.js');
const Listing=require('../models/listing.js');



router.post('/',async (req,res)=>{  
    reviewSchema.validate(req.body); 
    let {id}=req.params;
    const listing=await Listing.findById(id);
    const newReview=new Review(req.body.review);
    newReview.author=req.user._id;
 listing.reviews.push(newReview);
   newReview.save();
   listing.save();
   req.flash('success','Successfully created review!');
   res.redirect(`/listings/${listing._id}`);
});


//delete review route
router.delete('/:reviewId',async (req,res)=>{
    const {id,reviewId}=req.params;
    if (!Review.author._id.equals(req.user._id)) {
        req.flash('error', 'You are not the author of this review.');
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Review deleted!');
    res.redirect(`/listings/${id}`);
});
module.exports=router;




