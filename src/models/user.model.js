import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: String,
    phoneNumber: String,
    image: String,
    cart:[
            
        {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                productQuantity: {
                    type: Number,
                    default: 0,
                },
        }
    ],

    accessToken: {
        type: String,
    },
}, { timestamps: true })

export const User = mongoose.model('User', userSchema)

