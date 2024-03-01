import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';
import { ApiError } from '../helpers/ApiError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { comparePassword, hashPassword } from '../helpers/authHelper.js';
import { ApiResponse } from '../helpers/responsHandler.js';
import { User } from '../models/user.model.js';


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //* Validation
        if (
            [email, password, name].some(f => f?.trim() === "")
        ) {
            return res.status(403).json({
                message: "Please fill all fields"
            });
        }

        //* Check if the user is already available with the same email id
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({
                message: "User already exists"
            });
        }

        //* Hash the password
        const hashedPassword = await hashPassword(password);

        //* Create new user 
        const user = await new User({ name, email, password: hashedPassword }).save()
        res.status(201).json({ message: "user created successfully", success: true })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        //* check if email or password is not available
        if (!(email || password)) {
            return res.status(404).send({
                success: false,
                message: `email or password is not available`
            })
        }

        //* check user with this email is availableor not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: `Email is not registered`
            })
        }

        //* compare password
        const matches = comparePassword(password, user.password);
        if (!matches) {
            return res.status(200).Send({
                success: false,
                message: `Password is incorrect`
            })
        }

        //* token is ceated     
        const token = await jwt.sign({ _id: user._id }, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: "7d" })

        const options = {
            httpOnly: true,
            secure: false,
        }

        res
            .status(200)
            .cookie("JWT", token, options)
            .json({
                success: true,
                message: `login successful`,
                user: {
                    name: user.name,
                    email: user.email,
                    cart: user.cart
                },
                token,
            })

    } catch (error) {

        console.log(`Something went wrong in login: ${error.message}`);

        res.status(500).send({
            success: false,
            mesaage: `Something went wrong in login: ${error.message}`,
        })
    }
}
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json({
            success: true,
            message: `login successful`,
            user: {
                name: req.user.name,
                email: req.user.email,
                cart: req.user.cart
            },
        })
})
export const updateCartItem = asyncHandler(async (req, res) => {
    const { id, quantity } = req.body;
    const user = req.user

    if (!id || !quantity) {
        throw new ApiError(404, " need both id and quantity")
    }

    //* Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Product ID");
    }

    const existingProductIndex = user.cart.findIndex(item => item.productId && item.productId.equals(id));

    if (existingProductIndex !== -1) {
        // If the product already exists
        user.cart[existingProductIndex].productQuantity = quantity;
    } else {
        // If the product doesn't exist
        user.cart.push({ productId: id, productQuantity: quantity });
    }

    try {
        //* Save the updated user document
        await user.save({ validateBeforeSave: false })

    } catch (error) {
        console.error("Error while saving user cart:", error);
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(200).json(new ApiResponse(200, {}, "Product added to cart successfully"));
})
export const getCartItems = asyncHandler(async (req, res) => {

    try {
        let cart = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
            },
            { $unwind: "$cart" },
            {
                $lookup: {
                    from: "products", // The name of the Product collection
                    let: { productId: "$cart.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$productId"],
                                },
                            },
                        },
                        {
                            $project: {
                                price: 1,
                                actualPrice: 1,
                                description: 1,
                                thumbnail: 1,
                                rating: 1,
                            },
                        },
                    ],
                    as: "cart.productDetails",
                },
            },
            {
                $group: {
                    _id: "$_id",
                    cart: {
                        $push: {
                            productId: "$cart.productId",
                            productQuantity:
                                "$cart.productQuantity",
                            productDetails: {
                                $arrayElemAt: [
                                    "$cart.productDetails",
                                    0,
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    cart: 1
                },
            },
        ])

        res.status(200).json(new ApiResponse(200, cart, "cart fetched successfully"));

    } catch (error) {
        throw new ApiError(400, `Error fetching cart: ${error.message}`)
    }
})
export const deleteCartItem = asyncHandler(async (req, res) => {
    const { id, } = req.body;
    const user = req.user

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(404, " Invalid Product ID")
    }
    const productIndex = user.cart.findIndex(item => item.productId && item.productId.equals(id));
    user.cart.splice(productIndex, 1)
    try {
        //* Save the updated user document
        await user.save({ validateBeforeSave: false })
        res.status(200).json(new ApiResponse(200, {}, "Product deleted from cart successfully"));

    } catch (error) {
        throw new ApiError(404, `While deleting product this error occurred ${error.message}`)
    }
})
export const getWishlistItems = asyncHandler(async (req, res) => {


})
export const removeWishlistItem = asyncHandler(async (req, res) => {

    const { productId } = req.body;
    const user = req.user

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(404, " Invalid product Id ")
    }

    const existingProductIndex = user.wishlist.findIndex(item => item.equals(productId));

    if (existingProductIndex !== -1) {
        
        user.wishlist.splice(existingProductIndex,1);
        try {
            //* Save the updated user document
            await user.save({ validateBeforeSave: false });

            res.status(200).json(new ApiResponse(200, {}, "Product removed from wishlist successfully"));
    
        } catch (error) {
            console.error("Error while removing product from wishlist:", error);
            throw new ApiError(500, "Internal Server Error");
        }
        
    } else {
        throw new ApiError(404, "product not exists")
    }
})
export const addWishlistItem = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = req.user

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(404, " Invalid product Id ")
    }

    const existingProductIndex = user.wishlist.includes(productId)

    if (!existingProductIndex) {
        
        user.wishlist.push(productId);
        try {
            //* Save the updated user document
            await user.save({ validateBeforeSave: false });

            res.status(200).json(new ApiResponse(200, {}, "Product added to wishlist successfully"));
    
        } catch (error) {
            console.error("Error while saving product in wishlist:", error);
            throw new ApiError(500, "Internal Server Error");
        }
        
    } else {
        throw new ApiError(201, "product already exists")
    }

})