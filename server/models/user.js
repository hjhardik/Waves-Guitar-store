const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT = 10;
const crypto = require('crypto');
const moment = require("moment");
const jwt = require('jsonwebtoken');
require('dotenv').config();


const userSchema = mongoose.Schema({
    firstName:{
        type: String,
        required:true,
        maxlength: 50
    },
    lastName:{
        type:String,
        required:true,
        maxlength: 50
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlength:5
    },
    cart:{
        type:Array,
        default:[]
    },
    history:{
        type:Array,
        default:[]
    },
    role:{
        type:Number,
        default:0
    },
    token:{
        type:String
    },
    resetToken:{
        type:String
    },
    resetTokenExp:{
        type:Number
    }    
});

userSchema.pre('save', function(next){    ///before "save" is performed by server.js' user.save() function, this function will run
    var user = this;

    if(user.isModified('password')){  /// if later on user changes other fields then it will check if passowrd is changed, then only encrypt the new passwrd otherwise passes on 
        bcrypt.genSalt(SALT, function(err, salt){
            if(err) next(err);   ///kills this function and moves to the next thing 
            bcrypt.hash(user.password, salt, function(err,hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    } 
});

///adding a method to userSchema to compare passwords
userSchema.methods.comparePassword = function(candidatePassword, cb){     ///method to compare password //cb is the callback function
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) return cb(err);
        //else
        cb(null, isMatch);
    });
};


///// password reset token
userSchema.methods.generateResetToken = function(cb){
    var user = this;

    crypto.randomBytes(20,function(err,buffer){
        var token = buffer.toString('hex');
        var today = moment().startOf('day').valueOf();
        var tomorrow = moment(today).endOf('day').valueOf();

        user.resetToken = token;
        user.resetTokenExp = tomorrow;
        user.save(function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
}

///generate token each time for login
userSchema.methods.generateToken = function(cb){   //cb is the callback function
    var user = this;
    var token = jwt.sign(user._id.toHexString(), process.env.SECRET);

    user.token = token;
    user.save((err, user)=>{
        if(err) return cb(err);
        //else
        cb(null,user);
    })
};

userSchema.statics.findByToken = function(token,cb){
    var user = this;
    
    jwt.verify(token, process.env.SECRET, function(err,decode){
        ///decode is the _id returned after verfied
        user.findOne({"_id":decode, "token":token}, function(err,user){
            if(err) return cb(err);
            //else
            cb(null,user);
        })
    })
}


const User = mongoose.model('User', userSchema);

module.exports = {User};