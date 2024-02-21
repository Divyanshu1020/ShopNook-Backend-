import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title : {
        type : 'string',
        required : true,
    },
    description : {
        type : 'string',
    },
    aboutItem :{
        type: []
    },
    price : {
        type : 'number',
        default: 0,
    },
    discount : {
        type : 'number',
        default: 0,
    },
    rating :{
        type : 'number',
        default: 0,
    },
    stock : {
        type : 'number',
        default: 0,
    },
    brand : {
        type : 'string',
    },
    category : {
        type : 'string',
    },
    thumbnail :{
        type : 'string',
    },
    images :[],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
  },{timestamps:true})

  export const Product = mongoose.model("Product", productSchema)