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

/////users route

app.post('/api/users/register',(req,res)=> {
    const user = new User(req.body);
    user.save((err, savedUser)=>{
        if(err){
            return res.json({success:false, error:err});
        }else{
            return res.status(200).json({
                success:true,
                userdata : savedUser
            })
        }
    });


})

app.post('/api/users/login', (req,res)=> {
    
})

const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`server running at ${port}`);
});  