import dotenv from "dotenv";  
import connectDB from "./config/database.js";
import app from "./app.js";


//* Configuration
dotenv.config();

//* server starting
connectDB()
.then(() =>{
    app.on('error', err =>{
        console.log(`Somthing wrong with server/Express, Error is ${err}`);
    });
    app.listen(process.env.SERVER_PORT || 8000, ()=>{
        console.log(`Express server listening on ${process.env.SERVER_PORT}`);
    })
})
.catch(err =>{
    console.log(`Somthing wrong with database/Express, Error is ${err}`);
})








