import  Express, { urlencoded, json, static as static_ }  from "express";
import morgan from "morgan";
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = Express();

//* middlewares
app.use(cors({origin:"http://localhost:5173", credentials: true}));
app.use(cookieParser());
app.use(urlencoded({extended: true}))
app.use(static_("public"))
app.use(json());
app.use(morgan("dev"));


// //*Routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)

// //* rest api
app.get("/", (req, res) => {
    res.send("Hello World!");
});


export default app 