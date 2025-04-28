const express= require('express');
const router=express.Router({mergeParams:true});
const User=require('../models/user.js');
const wrapAsync=require('../utils/wrapAsync.js');
const passport = require('passport');

router.get('/signup',async(req,res)=>{
res.render('users/signup.ejs');
});


router.post('/signup',async(req,res)=>{
   try{  const {email,username,password}=req.body;
   let newUser= new User({
       email,username
   });
   await User.register(newUser,password);
   req.login(newUser,function(err){
       if(err) return next(err);
   });
req.flash('success','Welcome to RentalHub!');
   res.redirect('/listings');
  
  }
  catch(e){
    req.flash('error',e.message);
    res.redirect('/signup');
  }
} );

router.get('/login',async(req,res)=>{
    res.render('users/login.ejs');
});
router.post('/login',passport.authenticate("local", {failureRedirect :"/login",failureFlash:true}),async(req,res)=>{

    req.flash('success','Welcome back To RentalHub..!');
    res.redirect('/listings');
});

//logout user
router.get('/logout',async(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success','Goodbye! See you again soon!');
        res.redirect('/listings');
      });
});

module.exports=router;