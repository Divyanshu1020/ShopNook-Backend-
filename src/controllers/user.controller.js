import jwt from 'jsonwebtoken';
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