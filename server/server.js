const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

require('dotenv').config();



const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(`${process.env.DATABASE}`,{useNewUrlParser:true, useUnifiedTopology: true});




const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`server running at ${port}`);
}); 