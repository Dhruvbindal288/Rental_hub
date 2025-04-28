const { required } = require('joi');
const mongoose=require('mongoose');
const passport = require('passport');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new Schema({
    username:{
        type:String,
        required:true
    }
});

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model('User',userSchema);
module.exports=User;