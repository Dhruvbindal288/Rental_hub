if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const app = express();
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const wrapAsync=require('./utils/wrapAsync.js');
const ExpressError=require('./utils/ExpressError.js');
const {listingSchema,reviewSchema}=require('./schema.js');
const Review = require('./models/review.js');
const listingRouter=require('./routes/listing.js');
const reviewsRouter=require('./routes/review.js');
const usersRouter=require('./routes/user.js');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // for storing session in mongoDB
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
require('dotenv').config();



app.use(express.json());

// MongoDB connection
// const mongoURI = 'mongodb://localhost:27017/rental_website'; 
const dbUrl=process.env.ATLAS_URL
async function main() {
    try {
      await mongoose.connect(dbUrl);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
    }
  }
  main(); //  Call function

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret:process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // 24 hours
  
  });

// setup session
const sessionOptions={
  store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    copkie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7, // 1 week
        maxAge:1000*60*60*24*7 // 1 week
    }
}



app.use(session(sessionOptions));

//flash setup
app.use(flash());


  

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // to store user in session   
passport.deserializeUser(User.deserializeUser()); // to get user from session

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));    //req ka data pass kr payenge  
app.use(methodOverride('_method'));// method override for put and delete request..
app.engine('ejs',ejsMate);

//Serving Static files
app.use(express.static(path.join(__dirname,'public')));




// middleware for flash
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.curUser=req.user; // current user
    next();
});


// routes from router
app.use('/listings', listingRouter); //  listing routes
app.use('/listings/:id/reviews',reviewsRouter); // review routes
app.use('/',usersRouter); // user routes



//error handling middleware
app.all('*',(req,res,next)=>{
    next(new ExpressError(404,'Page Not Found'));
});

app.use((err,req,res,next)=>{
    const { statusCode = 500, message = 'Something went wrong!' } = err;
   res.status(statusCode).send(message);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



//req.session.count ek single session ki value count krta hai 
//req.query query string se data pass krta hai
//req.body form se data pass krta hai
//req.params url se data pass krta hai
//req.cookies cookies se data pass krta hai
//flash special area of the session used for storing messages..message are written to the flash and cleared  after being displayed to the user
//req.local used to pass data to templates..variables ko locally set krlete hai alg se pass nhi krna pdta
//Authentication process of veryfing someone
//autherization process of giving permission to someone kya kya kaam kr payega kya kcch use kr payega
//password storing ----> password ko kbhi bhi direct store nhi krte isse hashing ki form mai store krte hai
//hashing functions ----> are one way function for inpt they give fixed output of fixed length
//Salting -----> is a technique to make password more secure by adding a string of 32 or more characters to the password before hashing it.
//passport ---> middleware for authentication in express.js and node.js
//req.isAuthenticated() ---> checks if the user is authenticated or not
//Autherization for review -----> only autherized people can delete the review. 
//Mongo atlas ---> cloud database service for mongodb
