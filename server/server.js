const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

require('dotenv').config();



const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(`${process.env.DATABASE}`,{useNewUrlParser:true, useUnifiedTopology: true});


/////models
const {User} = require('./models/Users');

/////middleware
const {auth} = require('./middleware/auth');

app.get('./api/users/auth', auth, (req,res)=>{
    res.status(200).json({
        isAdmin : req.user.role===0? false:true,
        isAuth:true,
        email:req.user.email,
        firstName:req.user.firstName,
        lastName:req.user.lastName,
        cart:req.user.cart,
        history:req.user.history 
    });
})


/////users route
//register route
app.post('/api/users/register',(req,res)=> {
    const user = new User(req.body);
    user.save((err, savedUser)=>{
        if(err){
            return res.json({success:false, error:err});
        }else{
            return res.status(200).json({
                success:true,
            })
        }
    });
});

//login route
app.post('/api/users/login', (req,res)=> {
    User.findOne({'email':req.body.email}, (err,user){
        if(!user){
            return res.json({login:false, message:"email not registered"});
        }else{
            user.comparePassword(req.body.password,(err,isMatch) => {
                if(!isMatch){
                    return res.json({login:false, message:"wrong password"});
                }else{
                    user.generateToken((err,user) => {
                        if(err){
                            return res.status(400).send(err);
                        }else{
                            res.cookie('w_auth', user.token).status(200).json({login:"success"});
                        };
                    })
                };
            });     
        };
});






const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`server running at ${port}`);
});  