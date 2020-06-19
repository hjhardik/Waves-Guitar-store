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
const {Brand} = require('./models/Brands');
const {Wood} = require('./models/Woods');
const {Product} = require('./models/Products');

/////middleware
const {auth} = require('./middleware/auth');     //to check if the request is authenticated i.e. if the user is logged in
const {admin} = require('./middleware/admin');   //to check if the user is admin


/////////////////////////
///////////// BRANDS
/////////////////////////
app.post('/api/products/brand',auth,admin, (req,res)=>{
    const brand = new Brand(req.body);

    brand.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        //else
        res.status(200).json({
            success:true,
            brand:doc
        })
    })
})

app.get('/api/products/brands',(req,res)=>{
    Brand.find({}, (err,brands)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(brands);
    })
});

/////////////////////////
///////////// WOODS
/////////////////////////
app.post('/api/products/wood',auth,admin, (req,res)=>{
    const wood = new Wood(req.body);

    wood.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        //else
        res.status(200).json({
            success:true,
            wood:doc
        })
    })
})

app.get('/api/products/woods',(req,res)=>{
    Wood.find({}, (err,woods)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(woods);
    })
});

/////////////////////////
///////////// PRODUCTS
/////////////////////////
app.post('/api/products/articles',auth,admin, (req,res)=>{
    const product = new Product(req.body);

    product.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        //else
        res.status(200).json({
            success:true,
            product:doc
        })
    })
})

////  '/api/product/article?id=HSHSHKG,JSJSJS,SDSDSD&type=array' or type=single if only one id is present 
app.get('/api/product/articles_by_id',(req,res)=>{   //searching for products by id
    let type = req.query.type;
    let items = [];
    
    if(type === 'array'){
        let ids = req.query.id.split(',')  ///splitting different ids present in the request attributes
        items = [];
        items = ids.map(item=>{
            return mongoose.Types.ObjectId(item);   //converting each id into mongoose '_id' type
        });
    }

    Product.find({'_id':{$in:items}}).
    populate('brand').    ///as the brand field contains the id of object, it will populate the brand field with brand model data     
    populate('wood').     ///populates the wood field with wood model data fields
    exec((err,docs)=>{
        return res.status(200).send(docs);
    })
});

/////SORTING AND SEARCHING

//BY ARRIVAL
// '/articles?sortBy=createdAt&order=desc&limit=5'

//BY SELL
// '/articles?sortBy=sold&order=desc&limit=100&skip=5'

app.get('/api/product/articles',(req,res)=>{
    let order = req.query.order?req.query.order : 'asc';  //if order attribute is present then it will use it otherwise default is ascending order
    let sortBy = req.query.sortBy?req.query.sortBy : '_id';
    let limit = req.query.limit?parseInt(req.query.limit) : 100;
                    ///usinfg parseInt because by default it will be in string
    Product.
    find().
    populate('brand').
    populate('wood').
    sort([[sortBy,order]]).
    limit(limit).
    exec((err,articles)=>{
        if(err) return res.status(400).send(err);
        //else
        res.send(articles);
    })
});


////////////////////////
////////////  USERS
////////////////////////

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

app.get('/api/users/logout', auth, (req,res)=>{
    ///since for logout user must first already be logged in ie. authenticated
    ///THEREFORE we add the "auth" middleware
    User.findOneAndUpdate(
        { _id: req.user._id},
        {token:''},  ///token is updated to null
        (err,doc)=>{
            if(err) return res.json({success:false, err});
            //else
            return res.status(200).json({success:true});
        }
    )
});

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