import mongoose from "mongoose";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { ApiResponse } from "../helpers/responsHandler.js"
import { ApiError } from "../helpers/ApiError.js";





export const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find().limit(6)
        res.status(200).json(new ApiResponse(200, products, "Products successfully fatched"))
    } catch (error) {
        throw new ApiError(404, `While faching products this error occurred ${error.message}`)
    }

})
export const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const {userId} = req.body;

    //* Id is empty or not
    if (!productId) {
        throw new ApiError(400, "Product not found")
    }

    //* Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid Product ID");
    }

    const product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(productId),
            },
        },
        {
            $addFields: { user: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $addFields: {
                "isInWishlist": {
                    $in: ["$_id", "$user.wishlist"]
                }
            }
        },
        {
            $unset: ["user", "userId"],
        }
    ]);


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
