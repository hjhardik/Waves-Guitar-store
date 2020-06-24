const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const formidable = require('express-formidable');
const cloudinary = require('cloudinary');
const SHA1 = require("crypto-js/sha1"); 
const multer = require('multer');
const moment = require("moment");
const fs = require('fs');
const path = require('path');

const app = express();
const mongoose = require('mongoose');
const async = require('async');
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(`${process.env.DATABASE}`,{useNewUrlParser:true, useUnifiedTopology: true});


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
 
app.use(express.static('client/build'))

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// STORAGE MULTER CONFIG
let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}_${file.originalname}`)
    },
    // fileFilter:(req,file,cb)=>{

    //     const ext = path.extname(file.originalname)
    //     if(ext !== '.jpg' && ext !== '.png'){
    //         return cb(res.status(400).end('only jpg, png is allowed'),false);
    //     }

    //     cb(null,true)
    // }
});

// Models
const { User } = require('./models/user');
const { Brand } = require('./models/brand');
const { Wood } = require('./models/wood');
const { Product } = require('./models/product');
const { Payment } = require('./models/payment');
const { Site } = require('./models/site');

// Middlewares
const { auth } = require('./middleware/auth');     //to check if the request is authenticated i.e. if the user is logged in
const {admin} = require('./middleware/admin');     //to check if the user is admin

// UTILS
const { sendEmail } = require('./utils/mail/index');

//=================================
//             ADMIN UPLOADS
//=================================

const upload = multer({storage:storage }).single('file');

///upload the files and store them in uploads directory
app.post('/api/users/uploadfile',auth,admin,(req,res)=>{
    upload(req,res,(err)=>{
        if(err){
            return res.json({success:false,err})
        }
        return res.json({success:true})
    })
})
///get the files that are present inside the uploads folder i.e. that are uploaded by the user 
app.get('/api/users/admin_files',auth,admin,(req,res)=>{
    const dir = path.resolve(".")+'/uploads/';
    fs.readdir(dir,(err,items)=>{
        return res.status(200).send(items);
    })
});
///download the uploaded files from the uploads directory of the server
app.get('/api/users/download/:id',auth,admin,(req,res)=>{
    const file = path.resolve(".")+`/uploads/${req.params.id}`;
    res.download(file)
});

//=================================
//             PRODUCTS
//=================================

app.post('/api/product/shop',(req,res)=>{

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100; ///parseInt() converts string to int
    let skip = parseInt(req.body.skip);  ///if want to skip a number of starting entries 
    let findArgs = {};

    for(let key in req.body.filters){
        if(req.body.filters[key].length >0 ){
            if(key === 'price'){
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            }else{
                findArgs[key] = req.body.filters[key]
            }
        }
    }

    findArgs['publish'] = true;

    Product. 
    find(findArgs).
    populate('brand').
    populate('wood').
    sort([[sortBy,order]]).
    skip(skip).
    limit(limit).
    exec((err,articles)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            size: articles.length,
            articles
        })
    })
})

// =====================================================================
// req.params contains route parameters (in the path portion of the URL),
// and req.query contains the URL query parameters (after the ? in the URL).
//=======================================================================

// BY ARRIVAL
// /articles?sortBy=createdAt&order=desc&limit=4

// BY SELL
// /articles?sortBy=sold&order=desc&limit=100
app.get('/api/product/articles',(req,res)=>{

    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 100;

    Product.
    find().
    populate('brand').
    populate('wood').
    sort([[sortBy,order]]).
    limit(limit).
    exec((err,articles)=>{
        if(err) return res.status(400).send(err);
        res.send(articles)
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
                                       //{ field: { $in: [<value1>, <value2>, ... <valueN> ] } }
    Product.find({'_id':{$in:items}}). //If the field holds an array, then the $in operator selects//the documents whose field holds an array that contains at least one element that matches a value in the specified array (e.g. <value1>, <value2>, etc.)
    populate('brand').    ///as the brand field contains the id of object, it will populate the brand field with brand model data     
    populate('wood').     ///populates the wood field with wood model data fields
    exec((err,docs)=>{
        return res.status(200).send(docs);
    })
});


app.post('/api/product/article',auth,admin,(req,res)=>{
    const product = new Product(req.body);

    product.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success: true,
            article: doc
        })
    })
})

//=================================
//              WOODS
//=================================

app.post('/api/product/wood',auth,admin,(req,res)=>{
    const wood = new Wood(req.body);

    wood.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success: true,
            wood: doc
        })
    })
});

app.get('/api/product/woods',(req,res)=>{
    Wood.find({},(err,woods)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(woods)
    })
})


//=================================
//              BRAND
//=================================

app.post('/api/product/brand',auth,admin,(req,res)=>{
    const brand = new Brand(req.body);

    brand.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success:true,
            brand: doc
        })
    })
})

app.get('/api/product/brands',(req,res)=>{
    Brand.find({},(err,brands)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(brands)
    })
})


//=================================
//              USERS
//=================================

app.post('/api/users/reset_user',(req,res)=>{
    User.findOne(
        {'email':req.body.email},
        (err,user)=>{
            user.generateResetToken((err,user)=>{
                if(err) return res.json({success:false,err});
                sendEmail(user.email,user.name,null,"reset_password",user)
                return res.json({success:true})
            })
        }
    )
})

////////// reset password
app.post('/api/users/reset_password',(req,res)=>{

    var today = moment().startOf('day').valueOf();

    User.findOne({
        resetToken: req.body.resetToken,
        resetTokenExp:{
            $gte: today  //$gte selects the documents where the value of the field is 
                         //greater than or equal to (i.e. >=) a specified value (e.g. value.)
        }
    },(err,user)=>{
        if(!user) return res.json({success:false,message:'Sorry, the used token is not working, generate a new one.'})
        //else
        user.password = req.body.password; //changes the user password to new password
        user.resetToken = '';              // and ake the resettokens to '' again
        user.resetTokenExp= '';

        user.save((err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).json({
                success: true
            })
        })
    })
})


app.get('/api/users/auth',auth,(req,res)=>{
        res.status(200).json({
            isAdmin: req.user.role === 0 ? false : true,
            isAuth: true,
            email: req.user.email,
            name: req.user.name,
            lastname: req.user.lastname,
            role: req.user.role,
            cart: req.user.cart,
            history: req.user.history
        })
})

app.post('/api/users/register',(req,res)=>{
    const user = new User(req.body);

    user.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        sendEmail(doc.email,doc.name,null,"welcome");
        return res.status(200).json({
            success: true
        })
    })
});

app.post('/api/users/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({loginSuccess:false,message:'Auth failed, email not found'});

        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({loginSuccess:false,message:'Wrong password'});

            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('w_auth',user.token).status(200).json({
                    loginSuccess: true
                })
            })
        })
    })
})


app.get('/api/users/logout',auth,(req,res)=>{
    ///since for logout user must first already be logged in ie. authenticated
    ///THEREFORE we add the "auth" middleware
    User.findOneAndUpdate(
        { _id:req.user._id },
        { token: '' },
        (err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success: true
            })
        }
    )
});

////uploading images
app.post('/api/users/uploadimage',auth,admin,formidable(),(req,res)=>{ //Formidable is a Node.js module for parsing form data, including multipart/form-data file upload
    cloudinary.uploader.upload(req.files.file.path,(result)=>{
        console.log(result);
        res.status(200).send({
            public_id: result.public_id,
            url: result.url
        })
    },{
        public_id: `${Date.now()}`,
        resource_type: 'auto'
    })
})

////removing uploaded images
app.get('/api/users/removeimage',auth,admin,(req,res)=>{
    let image_id = req.query.public_id;

    cloudinary.uploader.destroy(image_id,(error,result)=>{
        if(error) return res.json({success:false,error});
        res.status(200).send('ok');
    })
})


app.post('/api/users/addToCart',auth,(req,res)=>{

    User.findOne({_id: req.user._id},(err,doc)=>{
        let duplicate = false;

        doc.cart.forEach((item)=>{   ////checks if the item is already present inside the cart and if present then duplicate updates to true
            if(item.id == req.query.productId){
                  duplicate = true;  
            }
        })

        if(duplicate){  /// if the item is already present in the cart it will increment its quantity by one
            User.findOneAndUpdate(
                {_id: req.user._id, "cart.id":mongoose.Types.ObjectId(req.query.productId)},
                { $inc: { "cart.$.quantity":1 } },   /////increments the quantity by one
                { new:true }, //The default is to return the original, unaltered document. 
                              //If you want the new, updated document to be returned you have to pass an additional argument: an object with the new property set to true.
                ()=>{
                    if(err) return res.json({success:false,err});
                    res.status(200).json(doc.cart)
                }
            )
        } else {   ////else adds the item to cart
            User.findOneAndUpdate(
                {_id: req.user._id},
                { $push:{ cart:{    //The $push operator appends a specified value to an array.
                                    //Here appends the new item to the cart
                    id: mongoose.Types.ObjectId(req.query.productId),
                    quantity:1,
                    date: Date.now()
                } }},
                { new: true },
                (err,doc)=>{
                    if(err) return res.json({success:false,err});
                    res.status(200).json(doc.cart)
                }
            )
        }
    })
});

//// remove item from the cart
app.get('/api/users/removeFromCart',auth,(req,res)=>{

    User.findOneAndUpdate(
        {_id: req.user._id },
        { "$pull":   ///$pull operator deletes the item from the array
                    /// here it deletes the specified item from the cart
            { "cart": {"id":mongoose.Types.ObjectId(req.query._id)} }
        },
        { new: true },
        (err,doc)=>{
            let cart = doc.cart;
            let array = cart.map(item=>{
                return mongoose.Types.ObjectId(item.id)
            });

            Product.
            find({'_id':{ $in: array }}).
            populate('brand').
            populate('wood').
            exec((err,cartDetail)=>{
                return res.status(200).json({
                    cartDetail,
                    cart
                })
            })
        }
    );
})

app.post('/api/users/successBuy',auth,(req,res)=>{
    let history = [];
    let transactionData = {}
    const date = new Date();
    const po = `PO-${date.getSeconds()}${date.getMilliseconds()}-${SHA1(req.user._id).toString().substring(0,8)}`

    // user history
    req.body.cartDetail.forEach((item)=>{
        history.push({
            porder: po,
            dateOfPurchase: Date.now(),
            name: item.name,
            brand: item.brand.name,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })

    // PAYMENTS DASH
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email
    }
    transactionData.data = {
        ...req.body.paymentData,
        porder: po
    };
    transactionData.product = history;
        
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push:{ history:history }, $set:{ cart:[] } }, //updates the history of orders field of the user
                                                         //and also sets the cart to 0 again
        { new: true },
        (err,user)=>{
            if(err) return res.json({success:false,err});

            const payment = new Payment(transactionData);
            payment.save((err,doc)=>{
                if(err) return res.json({success:false,err});
                //else
                let products = [];
                doc.product.forEach(item=>{
                    products.push({id:item.id,quantity:item.quantity})
                 })
              
                async.eachSeries(products,(item,callback)=>{ 
                    Product.update(
                        {_id: item.id},
                        { $inc:{
                            "sold": item.quantity
                        }},
                        {new:false},
                        callback
                    )
                },(err)=>{
                    if(err) return res.json({success:false,err});
                    sendEmail(user.email,user.name,null,"purchase",transactionData)
                    res.status(200).json({
                        success:true,
                        cart: user.cart,
                        cartDetail:[]
                    })
                })
            });
        }
    )
});


app.post('/api/users/update_profile',auth,(req,res)=>{

    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$set": req.body
        },
        { new: true },
        (err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        }
    );
});


//=================================
//              SITE
//=================================

// app.get('/api/site/site_data',(req,res)=>{
//     Site.find({},(err,site)=>{
//         if(err) return res.status(400).send(err);
//         res.status(200).send(site[0].siteInfo)
//     });
// });

// app.post('/api/site/site_data',auth,admin,(req,res)=>{
//     Site.findOneAndUpdate(
//         { name: 'Site'},
//         { "$set": { siteInfo: req.body }},
//         { new: true },
//         (err,doc )=>{
//             if(err) return res.json({success:false,err});
//             return res.status(200).send({
//                 success: true,
//                 siteInfo: doc.siteInfo
//             })
//         }
//     )
// })

// DEFAULT 
if( process.env.NODE_ENV === 'production' ){
    const path = require('path');
    app.get('/*',(req,res)=>{
        res.sendfile(path.resolve(__dirname,'../client','build','index.html'))
    })
}


const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server Running at ${port}`)
});
