import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
const URL = process.env.DB_URL || "localhost";

const connectDB = async() => {
    try {
        const db = await mongoose.connect(URL);
        console.log("Connected to mongoDB", db.connection.host)
        
    } catch (error) {
        console.log("Error in mongoDB",error);
    }
} 
 
export default connectDB;
