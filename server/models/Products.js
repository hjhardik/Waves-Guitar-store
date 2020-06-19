const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        required:true,
        type:String,
        unique:1,
        maxlength:70
    },
    description:{
        required:true,
        type:String,
        maxlength:1000
    },
    price:{
        required:true,
        type:Number,
        maxlength:100
    },
    brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required:true
    },
    wood:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wood',
        required:true
    },
    shipping:{
        type:Boolean,
        required:true
    },
    available:{
        required:true,
        type:Boolean
    },
    sold:{
        type:Number,
        maxlength:100,
        default:0
    },
    publish:{
        type:Boolean,
        required:true
    },
    images:{
        type:Array,
        default:[]
    }
},{timestamps:true});

const Product = mongoose.model('Product', productSchema);

module.exports = {Product}