import mongoose from "mongoose";
import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/responsHandler.js";
import { Product } from "../models/product.model.js";





// @ts-ignore
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
    const { userId } = req.body;

    //* Id is empty or not
    if (!productId) {
        throw new ApiError(400, "Product not found");
    }

    //* Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid Product ID");
    }

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(productId),
            },
        }
    ];

    if (userId) {
        pipeline.push(
            {
                $addFields: { userId: new mongoose.Types.ObjectId(userId) },
                // @ts-ignore
                $match: undefined
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
                $unwind: "$user"
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
        );
    } else {
        pipeline.push(
            {
                $addFields: {
                    "isInWishlist": false
                },
                
            },
        )
    }

    const product = await Product.aggregate(pipeline);

    if (!product) {
        throw new ApiError(500, "couldn't fetch product");
    }

    res.status(200).json(new ApiResponse(200, product, "Fetched Product successfully"));
});

export const addProduct = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const newProduct = await Product.create({ title, description })

    res
        .status(200)
        .json(new ApiResponse(200, newProduct, "add"))

})
