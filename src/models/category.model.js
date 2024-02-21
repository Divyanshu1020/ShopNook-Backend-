import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    title : {
        type : 'string',
        required : true,
    }
},{});

export const Category = mongoose.model('Category', categorySchema);