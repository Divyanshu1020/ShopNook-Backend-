import jwt from 'jsonwebtoken';

import { ApiResponse } from '../helpers/responsHandler.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { comparePassword, hashPassword } from '../helpers/authHelper.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';
import { ApiError } from '../helpers/ApiError.js';


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
export const updateCart = asyncHandler(async (req, res) => {
    const { id, quantity } = req.body;
    const user = req.user

    if (!(id || quantity)) {
        throw new ApiError(404, " need both id and quantity")
    }

    
    const existingProductIndex = user.cart.findIndex(item => item.productId.toString() === id);
    
    if (existingProductIndex !== -1) {
        // If the product already exists
        user.cart[existingProductIndex].productQuantity = quantity;
    } else {
        // If the product doesn't exist
        user.cart.push({ productId: id, productQuantity: quantity });
    }

    try {
        //* Save the updated user document
        await user.save({validateBeforeSave: false})

    } catch (error) {
        console.error("Error while saving user cart:", error);
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(200).json(new ApiResponse(200, user, "Product added to cart successfully"));
})
export const getCart = asyncHandler(async (req, res) => {

    let cart = await User.aggregate([

        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
        { $unwind: "$cart" },
        {
            $lookup: {
                from: "products",
                localField: "cart.productId",
                foreignField: "_id",
                as: "cart.productDetails"
            }
        },
        {
            $group: {
                _id: "$_id",
                role: { $first: "$role" },
                name: { $first: "$name" },
                email: { $first: "$email" },
                password: { $first: "$password" },
                address: { $first: "$address" },
                phoneNumber: { $first: "$phoneNumber" },
                image: { $first: "$image" },
                cart: {
                    $push: {
                        productId: "$cart.productId",
                        productQuantity: "$cart.productQuantity",
                        productDetails: { $arrayElemAt: ["$cart.productDetails", 0] }
                    }
                },
                accessToken: { $first: "$accessToken" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" }
            }
        }
    ])


    res.status(200).json({
        statusCode: 200,
        data: cart,
        message: "cart fetched successfully"
      });
})
