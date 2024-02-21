import { asyncHandler } from "../helpers/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { ApiResponse} from "../helpers/responsHandler.js"





export const getAllProducts = asyncHandler( async(req, res) => {

})
export const getProductById = asyncHandler( async(req, res) => {

})
export const addProduct = asyncHandler( async(req, res) => {
    const { title, description} = req.body
    const newProduct = await Product.create({ title, description})

    res
    .status(200)
    .json( new ApiResponse(200, newProduct, "add") )

})
