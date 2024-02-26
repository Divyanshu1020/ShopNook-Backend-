import mongoose from "mongoose";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { ApiResponse } from "../helpers/responsHandler.js"
import { ApiError } from "../helpers/ApiError.js";





export const getAllProducts = asyncHandler(async (req, res) => {

})
export const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params

    //* Id is empty or not
    if (!productId) {
        throw new ApiError(400, "Product not found")
    }

    //* Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid Product ID");
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(500, "couldn't fatch product")
    }

    res.status(200).json(new ApiResponse(200, product, "Fached Product successfully"))
})
export const addProduct = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const newProduct = await Product.create({ title, description })

    res
        .status(200)
        .json(new ApiResponse(200, newProduct, "add"))

})
